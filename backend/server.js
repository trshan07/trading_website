// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Basic middleware (without morgan for now)
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware (replacement for morgan)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// WebSocket (optional for now)
let wss = null;
try {
    const WebSocket = require('ws');
    wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to Rizal\'s Trade' }));
    });
    console.log('WebSocket server initialized');
} catch (error) {
    console.log('WebSocket not available, continuing without it');
}

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});