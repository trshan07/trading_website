const db = require('../config/database');

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

let creditGrantsTableEnsured = false;

const isValidExpiryDate = (value) => {
    if (!value) {
        return false;
    }

    const normalized = String(value).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized) && !Number.isNaN(Date.parse(`${normalized}T00:00:00Z`));
};

const ensureCreditGrantsTable = async () => {
    if (creditGrantsTableEnsured) {
        return;
    }

    await db.query(`
        CREATE TABLE IF NOT EXISTS credit_grants (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
            amount DECIMAL(15,2) NOT NULL,
            remaining_amount DECIMAL(15,2) NOT NULL,
            expiry_date DATE,
            status VARCHAR(20) DEFAULT 'active',
            source_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
            expired_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    creditGrantsTableEnsured = true;
};

const createCreditGrant = async ({ userId, accountId, amount, expiryDate, sourceTransactionId = null, note = '' }) => {
    const creditAmount = Math.abs(toNumber(amount));
    if (!creditAmount || !isValidExpiryDate(expiryDate)) {
        return null;
    }

    await ensureCreditGrantsTable();
    const { rows } = await db.query(
        `INSERT INTO credit_grants (
            user_id, account_id, amount, remaining_amount, expiry_date, source_transaction_id, note
        ) VALUES ($1, $2, $3, $3, $4::date, $5, $6)
        RETURNING *`,
        [userId, accountId, creditAmount, expiryDate, sourceTransactionId, note]
    );
    return rows[0];
};

const consumeCreditGrants = async ({ accountId, amount }) => {
    let remainingToConsume = Math.abs(toNumber(amount));
    if (!remainingToConsume) {
        return;
    }

    await ensureCreditGrantsTable();
    const { rows: grants } = await db.query(
        `SELECT *
         FROM credit_grants
         WHERE account_id = $1
           AND status = 'active'
           AND remaining_amount > 0
         ORDER BY expiry_date NULLS LAST, created_at ASC, id ASC`,
        [accountId]
    );

    for (const grant of grants) {
        if (remainingToConsume <= 0) {
            break;
        }

        const currentRemaining = toNumber(grant.remaining_amount);
        const consumed = Math.min(currentRemaining, remainingToConsume);
        const nextRemaining = currentRemaining - consumed;
        remainingToConsume -= consumed;

        await db.query(
            `UPDATE credit_grants
             SET remaining_amount = $1,
                 status = CASE WHEN $1 <= 0 THEN 'consumed' ELSE status END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [nextRemaining, grant.id]
        );
    }
};

const expireDueCreditGrants = async ({ userId = null, accountId = null } = {}) => {
    await ensureCreditGrantsTable();

    const params = [];
    const filters = [
        "cg.status = 'active'",
        'cg.remaining_amount > 0',
        'cg.expiry_date IS NOT NULL',
        'cg.expiry_date < CURRENT_DATE'
    ];

    if (userId) {
        params.push(userId);
        filters.push(`cg.user_id = $${params.length}`);
    }

    if (accountId) {
        params.push(accountId);
        filters.push(`cg.account_id = $${params.length}`);
    }

    const { rows: accountsWithExpiredCredits } = await db.query(
        `SELECT
            cg.account_id,
            cg.user_id,
            SUM(cg.remaining_amount) AS expired_amount,
            a.credit AS current_credit
         FROM credit_grants cg
         JOIN accounts a ON a.id = cg.account_id
         WHERE ${filters.join(' AND ')}
         GROUP BY cg.account_id, cg.user_id, a.credit`,
        params
    );

    for (const row of accountsWithExpiredCredits) {
        const expiredAmount = Math.min(toNumber(row.expired_amount), toNumber(row.current_credit));
        const nextCredit = Math.max(0, toNumber(row.current_credit) - expiredAmount);

        await db.query('UPDATE accounts SET credit = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
            nextCredit,
            row.account_id
        ]);

        let transactionId = null;
        if (expiredAmount > 0) {
            const { rows: transactions } = await db.query(
                `INSERT INTO transactions (user_id, account_id, type, amount, balance_before, balance_after, description)
                 VALUES ($1, $2, 'credit_expiry', $3, $4, $5, $6)
                 RETURNING id`,
                [
                    row.user_id,
                    row.account_id,
                    expiredAmount,
                    toNumber(row.current_credit),
                    nextCredit,
                    'Credit expired automatically'
                ]
            );
            transactionId = transactions[0]?.id || null;
        }

        await db.query(
            `UPDATE credit_grants
             SET remaining_amount = 0,
                 status = 'expired',
                 expired_transaction_id = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE account_id = $2
               AND status = 'active'
               AND remaining_amount > 0
               AND expiry_date IS NOT NULL
               AND expiry_date < CURRENT_DATE`,
            [transactionId, row.account_id]
        );
    }
};

module.exports = {
    consumeCreditGrants,
    createCreditGrant,
    expireDueCreditGrants,
    isValidExpiryDate
};
