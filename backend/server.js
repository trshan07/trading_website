// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Import database connection
require('./src/config/database');

// Import routes
const authRoutes = require('./src/client/routes/authRoutes');
const adminRoutes = require('./src/admin/routes/adminRoutes');
const tradingRoutes = require('./src/client/routes/tradingRoutes');
const userRoutes = require('./src/client/routes/userRoutes');
const fundingRoutes = require('./src/client/routes/fundingRoutes');
const kycRoutes = require('./src/client/routes/kycRoutes');
const infrastructureRoutes = require('./src/client/routes/infrastructureRoutes');
const publicRoutes = require('./src/public/routes/publicRoutes');
const { protect, admin } = require('./src/middleware/authMiddleware');

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet({
    contentSecurityPolicy: false,
}));

// CORS configuration
const corsOptions = {
    origin: '*',
    credentials: false,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ─── Static Files ─────────────────────────────────────────────────────────────

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Root info
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Rizal's Trade Backend API",
        version: '1.0.0',
        api_health: `${process.env.API_URL || 'http://localhost:5000'}/api/health`,
        documentation: 'The API endpoints are located under /api/auth and /api/admin'
    });
});

// API info
app.get('/api', (req, res) => {
    res.json({
        version: '1.0.0',
        status: 'Active',
        endpoints: {
            auth: {
                register:       'POST /api/auth/register',
                login:          'POST /api/auth/login',
                demo:           'POST /api/auth/demo-login',
                forgotPassword: 'POST /api/auth/forgot-password',
                resetPassword:  'POST /api/auth/reset-password'
            },
            public: {
                markets:      'GET  /api/public/markets',
                categories:   'GET  /api/public/markets/:category',
                contact:      'POST /api/public/contact',
                promotions:   'GET  /api/public/promotions',
                accountTypes: 'GET  /api/public/account-types'
            },
            admin: {
                users:       'GET    /api/admin/users',
                user:        'GET    /api/admin/users/:id',
                createAdmin: 'POST   /api/admin/users/admin',
                updateUser:  'PUT    /api/admin/users/:id',
                deleteUser:  'DELETE /api/admin/users/:id'
            },
            protected: {
                profile: 'GET /api/users/profile',
                adminDashboard: 'GET /api/admin/dashboard'
            },
            health: 'GET /api/health',
            test:   'GET /api/test'
        }
    });
});

// Feature routes
app.use('/api/auth',   authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/users',  userRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/kyc',    kycRoutes);
app.use('/api/infra',  infrastructureRoutes);

// Admin dashboard
app.get('/api/admin/dashboard', protect, admin, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to admin dashboard',
        data: { admin: req.user }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: 'Connected'
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend API is working!',
        timestamp: new Date().toISOString()
    });
});

// ─── WebSocket ────────────────────────────────────────────────────────────────

try {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('🔌 WebSocket client connected');
        ws.send(JSON.stringify({
            type: 'connected',
            message: "Welcome to Rizal's Trade",
            timestamp: new Date().toISOString()
        }));

        ws.on('message', (message) => {
            console.log('📨 WS message received:', message.toString());
        });

        ws.on('close', () => {
            console.log('🔌 WebSocket client disconnected');
        });
    });

    console.log('✅ WebSocket server initialized');
} catch (error) {
    console.log('⚠️  WebSocket not available, continuing without it');
}

// ─── Error Handlers ───────────────────────────────────────────────────────────

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Auth URL: http://localhost:${PORT}/api/auth`);
    console.log(`🔗 Admin URL: http://localhost:${PORT}/api/admin`);
    console.log(`💻 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});
