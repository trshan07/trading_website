// backend/src/public/models/AccountTypeInfo.js
const db = require('../../config/database');

class AccountTypeInfo {
    static async findAllActive() {
        const { rows } = await db.query('SELECT * FROM account_types_info WHERE is_active = true ORDER BY min_deposit ASC');
        return rows;
    }
}

module.exports = AccountTypeInfo;
