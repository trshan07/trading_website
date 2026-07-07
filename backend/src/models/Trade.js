// backend/src/models/Trade.js
const db = require('../config/database');

class Trade {
    static async getTableColumns(tableName) {
        const { rows } = await db.query(
            `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
            `,
            [tableName]
        );

        return new Set(rows.map((row) => row.column_name));
    }

    static columnExpr(columns, preferredNames, fallback = 'NULL') {
        for (const name of preferredNames) {
            if (columns.has(name)) {
                return name;
            }
        }

        return fallback;
    }

    static buildPositionSelect(columns, statusFilter = null) {
        const exitPriceExpr = this.columnExpr(columns, ['close_price', 'exit_price']);
        const grossPnlExpr = columns.has('gross_pnl') ? 'p.gross_pnl' : '0';
        const swapExpr = columns.has('swap') ? 'p.swap' : '0';
        const commissionExpr = columns.has('commission') ? 'p.commission' : '0';
        const createdAtExpr = this.columnExpr(columns, ['created_at', 'opened_at']);
        const updatedAtExpr = this.columnExpr(columns, ['updated_at', 'created_at', 'opened_at']);

        let query = `
            SELECT
                p.id,
                p.user_id,
                p.account_id,
                p.symbol,
                p.side,
                p.amount AS usd_amount,
                p.quantity AS amount,
                p.entry_price,
                ${exitPriceExpr === 'NULL' ? 'NULL' : `p.${exitPriceExpr}`} AS exit_price,
                COALESCE(p.pnl, 0) AS pnl,
                ${grossPnlExpr} AS gross_pnl,
                ${swapExpr} AS swap,
                ${commissionExpr} AS commission,
                p.status,
                ${createdAtExpr === 'NULL' ? 'NULL' : `p.${createdAtExpr}`} AS created_at,
                ${updatedAtExpr === 'NULL' ? 'NULL' : `p.${updatedAtExpr}`} AS updated_at,
                a.account_type,
                u.email AS user_email,
                u.first_name,
                u.last_name,
                a.account_number
            FROM positions p
            JOIN users u ON p.user_id = u.id
            JOIN accounts a ON p.account_id = a.id
        `;
        const values = [];

        if (statusFilter && statusFilter !== 'all') {
            query += ' WHERE p.status = $1';
            values.push(statusFilter);
        }

        query += ` ORDER BY ${createdAtExpr === 'NULL' ? 'p.id' : `p.${createdAtExpr}` } DESC, p.id DESC`;

        return { query, values };
    }

    static buildLegacyTradeSelect(columns, statusFilter = null) {
        const exitPriceExpr = this.columnExpr(columns, ['exit_price', 'close_price']);
        const createdAtExpr = this.columnExpr(columns, ['created_at', 'opened_at']);
        const updatedAtExpr = this.columnExpr(columns, ['updated_at', 'created_at', 'opened_at']);

        let query = `
            SELECT
                t.id,
                t.user_id,
                t.account_id,
                t.symbol,
                t.side,
                t.amount AS usd_amount,
                CASE
                    WHEN COALESCE(t.entry_price, 0) = 0 THEN 0
                    ELSE t.amount / t.entry_price
                END AS amount,
                t.entry_price,
                ${exitPriceExpr === 'NULL' ? 'NULL' : `t.${exitPriceExpr}`} AS exit_price,
                COALESCE(t.pnl, 0) AS pnl,
                0 AS gross_pnl,
                0 AS swap,
                0 AS commission,
                t.status,
                ${createdAtExpr === 'NULL' ? 'NULL' : `t.${createdAtExpr}`} AS created_at,
                ${updatedAtExpr === 'NULL' ? 'NULL' : `t.${updatedAtExpr}`} AS updated_at,
                a.account_type,
                u.email AS user_email,
                u.first_name,
                u.last_name,
                a.account_number
            FROM trades t
            JOIN users u ON t.user_id = u.id
            JOIN accounts a ON t.account_id = a.id
        `;
        const values = [];

        if (statusFilter && statusFilter !== 'all') {
            query += ' WHERE t.status = $1';
            values.push(statusFilter);
        }

        query += ` ORDER BY ${createdAtExpr === 'NULL' ? 't.id' : `t.${createdAtExpr}` } DESC, t.id DESC`;

        return { query, values };
    }

    static normalizeTradeRows(rows) {
        const seen = new Set();
        const normalized = [];

        const sortKey = (row) => {
            const dateValue = row.created_at || row.updated_at || null;
            const time = dateValue ? new Date(dateValue).getTime() : 0;
            return Number.isFinite(time) ? time : 0;
        };

        rows
            .sort((a, b) => sortKey(b) - sortKey(a))
            .forEach((row) => {
                const key = [
                    row.user_id,
                    row.account_id,
                    row.symbol,
                    row.side,
                    row.usd_amount,
                    row.entry_price,
                    row.exit_price,
                    row.status,
                    row.created_at || '',
                    row.updated_at || '',
                ].join('|');

                if (seen.has(key)) {
                    return;
                }

                seen.add(key);
                normalized.push(row);
            });

        return normalized;
    }

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
        try {
            const [positionsColumns, tradesColumns] = await Promise.all([
                this.getTableColumns('positions'),
                this.getTableColumns('trades'),
            ]);

            const rows = [];

            if (positionsColumns.size > 0) {
                const { query, values } = this.buildPositionSelect(positionsColumns, statusFilter);
                const positionRows = await db.query(query, values);
                rows.push(...positionRows.rows);
            }

            if (tradesColumns.size > 0) {
                const { query, values } = this.buildLegacyTradeSelect(tradesColumns, statusFilter);
                const legacyRows = await db.query(query, values);
                rows.push(...legacyRows.rows);
            }

            return this.normalizeTradeRows(rows);
        } catch (error) {
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

    static async deleteById(tradeId, client = db) {
        const query = 'DELETE FROM positions WHERE id = $1 RETURNING *';
        const { rows } = await client.query(query, [tradeId]);
        return rows[0];
    }
}

module.exports = Trade;
