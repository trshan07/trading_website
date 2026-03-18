// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Import database connection
require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { protect, admin } = require('./src/middleware/authMiddleware');

// Basic middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Rizal\'s Trade Backend API',
        version: '1.0.0',
        api_health: 'http://localhost:5000/api/health',
        documentation: 'The API endpoints are located under /api/auth and /api/admin'
    });
});

// API Information route
app.get('/api', (req, res) => {
    res.json({
        version: '1.0.0',
        status: 'Active',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                demo: 'POST /api/auth/demo-login',
                forgotPassword: 'POST /api/auth/forgot-password',
                resetPassword: 'POST /api/auth/reset-password'
            },
            admin: {
                users: 'GET /api/admin/users',
                user: 'GET /api/admin/users/:id',
                createAdmin: 'POST /api/admin/users/admin',
                updateUser: 'PUT /api/admin/users/:id',
                deleteUser: 'DELETE /api/admin/users/:id'
            },
            protected: {
                profile: 'GET /api/user/profile',
                adminDashboard: 'GET /api/admin/dashboard'
            },
            health: 'GET /api/health',
            test: 'GET /api/test'
        }
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Protected user route
app.get('/api/user/profile', protect, (req, res) => {
    res.json({ 
        success: true,
        data: {
            user: req.user
        }
    });
});

// Admin dashboard route
app.get('/api/admin/dashboard', protect, admin, (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to admin dashboard',
        data: {
            admin: req.user
        }
    });
});

// Health check route
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

// WebSocket setup (optional)
let wss = null;
try {
    const WebSocket = require('ws');
    wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log('🔌 WebSocket client connected');
        ws.send(JSON.stringify({ 
            type: 'connected', 
            message: 'Welcome to Rizal\'s Trade',
            timestamp: new Date().toISOString()
        }));

        ws.on('message', (message) => {
            console.log('Received:', message.toString());
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
    });
    console.log('✅ WebSocket server initialized');
} catch (error) {
    console.log('⚠️ WebSocket not available, continuing without it');
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({ 
        success: false,
        error: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found' 
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Auth URL: http://localhost:${PORT}/api/auth`);
    console.log(`🔗 Admin URL: http://localhost:${PORT}/api/admin`);
    console.log(`💻 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});