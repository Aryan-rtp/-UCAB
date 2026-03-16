/**
 * UCAB Server Entry Point
 *
 * Sets up Express server with:
 * - CORS configuration
 * - JSON body parsing
 * - API route mounting
 * - Socket.io for real-time communication
 * - Global error handling
 * - MongoDB connection
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, '../public')));

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// ─── Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach io instance to every request for controllers to use
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/driver', require('./routes/driverRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Socket.io Connection Handling ───────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join user-specific room
  socket.on('joinRoom', ({ userId, role }) => {
    const room = `${role}_${userId}`;
    socket.join(room);
    console.log(`${role} ${userId} joined room: ${room}`);
  });

  // Join ride-specific room for tracking
  socket.on('joinRide', ({ rideId }) => {
    socket.join(`ride_${rideId}`);
    console.log(`Joined ride room: ride_${rideId}`);
  });

  // Driver location broadcast
  socket.on('driverLocationUpdate', ({ rideId, coordinates }) => {
    io.to(`ride_${rideId}`).emit('driverLocationChanged', { coordinates });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});





app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Error Handler (must be after routes) ────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`UCAB Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();

module.exports = { app, server, io };
