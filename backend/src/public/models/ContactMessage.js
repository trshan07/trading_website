// backend/src/public/models/ContactMessage.js
const db = require('../../config/database');

class ContactMessage {
    static async create(messageData) {
        const { fullName, email, subject, message } = messageData;
        const query = `
            INSERT INTO contact_messages (full_name, email, subject, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [fullName, email, subject, message];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = ContactMessage;
