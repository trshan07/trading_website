// backend/src/models/Trade.js
const db = require('../config/database');
const { isMissingColumnError } = require('../utils/dbCompat');

class Trade {
    static async create(tradeData) {
        const { userId, accountId, symbol, side, amount, entryPrice, quantity, margin } = tradeData;
        const query = `
            INSERT INTO positions (
                user_id, account_id, symbol, side, amount, quantity,
                entry_price, current_price, margin, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, 'open')
            RETURNING *
        `;
        const parsedAmount = Number(amount) || 0;
        const parsedEntryPrice = Number(entryPrice) || 0;
        const parsedQuantity = quantity != null
            ? Number(quantity)
            : parsedEntryPrice > 0
                ? parsedAmount / parsedEntryPrice
                : 0;
        const parsedMargin = margin != null ? Number(margin) : parsedAmount;
        const values = [userId, accountId, symbol, side, parsedAmount, parsedQuantity, parsedEntryPrice, parsedMargin];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findActiveByUserId(userId, accountId) {
        const query = `
            SELECT * FROM positions
            WHERE user_id = $1 AND account_id = $2 AND status = 'open'
            ORDER BY id DESC
        `;
        const { rows } = await db.query(query, [userId, accountId]);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM positions WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async close(tradeId, exitPrice, pnl) {
        const query = `
            UPDATE positions 
            SET close_price = $1, pnl = $2, status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING *
        `;
        const { rows } = await db.query(query, [exitPrice, pnl, tradeId]);
        return rows[0];
    }

    static async getHistory(userId, accountId) {
        const query = `
            SELECT * FROM positions
            WHERE user_id = $1 AND account_id = $2 AND status = 'closed'
            ORDER BY updated_at DESC
        `;
        const { rows } = await db.query(query, [userId, accountId]);
        return rows;
    }

    static async findAll(statusFilter = null) {
        const buildQuery = ({ includeFeeColumns, includeLegacyTrades }) => {
            const feeProjection = includeFeeColumns
                ? 'p.gross_pnl, p.swap, p.commission,'
                : 'p.gross_pnl, 0 AS swap, 0 AS commission,';

            const positionSelect = `
                SELECT
                    p.id,
                    p.user_id,
                    p.account_id,
                    p.symbol,
                    p.side,
                    p.amount as usd_amount,
                    p.quantity as amount,
                    p.entry_price,
                    p.close_price as exit_price,
                    p.pnl,
                    ${feeProjection}
                    p.status,
                    p.created_at,
                    p.updated_at,
                    u.email as user_email,
                    u.first_name,
                    u.last_name,
                    a.account_number
                FROM positions p
                JOIN users u ON p.user_id = u.id
                JOIN accounts a ON p.account_id = a.id
            `;

            const legacySelect = includeLegacyTrades
                ? `
                    SELECT
                        t.id,
                        t.user_id,
                        t.account_id,
                        t.symbol,
                        t.side,
                        t.amount as usd_amount,
                        CASE
                            WHEN COALESCE(t.entry_price, 0) = 0 THEN 0
                            ELSE t.amount / t.entry_price
                        END as amount,
                        t.entry_price,
                        t.exit_price,
                        COALESCE(t.pnl, 0) as pnl,
                        0 as gross_pnl,
                        0 as swap,
                        0 as commission,
                        t.status,
                        t.created_at,
                        t.updated_at,
                        u.email as user_email,
                        u.first_name,
                        u.last_name,
                        a.account_number
                    FROM trades t
                    JOIN users u ON t.user_id = u.id
                    JOIN accounts a ON t.account_id = a.id
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM positions p
                        WHERE p.user_id = t.user_id
                          AND p.account_id = t.account_id
                          AND p.symbol = t.symbol
                          AND p.side = t.side
                          AND p.amount = t.amount
                          AND p.entry_price = t.entry_price
                          AND p.created_at = t.created_at
                    )
                `
                : null;

            const whereClause = statusFilter && statusFilter !== 'all'
                ? ` WHERE status = $1`
                : '';

            const orderClause = ' ORDER BY created_at DESC';

            if (legacySelect) {
                return {
                    query: `
                        WITH combined_trades AS (
                            ${positionSelect}
                            UNION ALL
                            ${legacySelect}
                        )
                        SELECT * FROM combined_trades${whereClause}${orderClause}
                    `,
                    values: statusFilter && statusFilter !== 'all' ? [statusFilter] : [],
                };
            }

            return {
                query: `${positionSelect}${whereClause}${orderClause}`,
                values: statusFilter && statusFilter !== 'all' ? [statusFilter] : [],
            };
        };

        const runQuery = async (options) => {
            const { query, values } = buildQuery(options);
            const { rows } = await db.query(query, values);
            return rows;
        };

        try {
            return await runQuery({ includeFeeColumns: true, includeLegacyTrades: true });
        } catch (error) {
            if (isMissingColumnError(error)) {
                try {
                    return await runQuery({ includeFeeColumns: false, includeLegacyTrades: true });
                } catch (legacyError) {
                    if (legacyError?.code === '42P01') {
                        return await runQuery({ includeFeeColumns: false, includeLegacyTrades: false });
                    }
                    throw legacyError;
                }
            }

            if (error?.code === '42P01') {
                return await runQuery({ includeFeeColumns: true, includeLegacyTrades: false });
            }

            throw error;
        }
    }

    static async cancel(tradeId) {
        const query = `
            UPDATE positions
            SET status = 'cancelled', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND status = 'open'
            RETURNING *
        `;
        const { rows } = await db.query(query, [tradeId]);
        return rows[0];
    }
}

module.exports = Trade;
