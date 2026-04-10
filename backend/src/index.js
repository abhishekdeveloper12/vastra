import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

// Create HTTP server and Socket.io server
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

if (!mongoUri) {
  console.error('MONGODB_URI is missing. Please add it to backend/.env');
  process.exit(1);
}

app.use(cors({
  origin: [
    'https://vastra-ra0s.onrender.com'
  ],
  credentials: true,
}));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.set('strictQuery', false);
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });




app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);

// Global error handler to always return JSON
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room for a product chat (buyer-seller)
  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle chat messages
  socket.on('chatMessage', ({ roomId, sender, message }) => {
    io.to(roomId).emit('chatMessage', { sender, message, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Backend server with Socket.io running on https://vastra12.onrender.com`);
});
