const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const db = require('../config/database');
const { isMissingColumnError } = require('../utils/dbCompat');

const findLegacyAdminById = async (id) => {
    const { rows } = await db.query(
        'SELECT id, name, email, password, role, is_active, created_at FROM admins WHERE id = $1',
        [id]
    );

    if (!rows[0]) {
        return null;
    }

    const nameParts = String(rows[0].name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    return {
        ...rows[0],
        first_name: firstName,
        last_name: lastName,
        password_hash: rows[0].password,
        phone: null,
        country: null,
    };
};

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth Debug - Decoded Token:', { id: decoded.id, role: decoded.role });

        // Get user from the token based on the encoded role to avoid ID collisions
        let user;
        if (decoded.role === 'admin' || decoded.role === 'super_admin') {
            try {
                user = await Admin.findById(decoded.id);
            } catch (error) {
                if (isMissingColumnError(error)) {
                    user = await findLegacyAdminById(decoded.id);
                } else {
                    throw error;
                }
            }
        } else {
            user = await User.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Not authorized, token failed:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a super admin' });
    }
};

module.exports = { protect, admin, superAdmin };
