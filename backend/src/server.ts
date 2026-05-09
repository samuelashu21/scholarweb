import dotenv from 'dotenv';
dotenv.config(); // MUST BE FIRST

import express from 'express';
import cors from 'cors';

import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import likeRoutes from './routes/likeRoutes';
import chatRoutes from './routes/chatRoutes';

// DB connection AFTER env is loaded
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/chats', chatRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Port safety fix
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;