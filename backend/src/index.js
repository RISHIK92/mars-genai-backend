import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './api/v1/auth/routes.js';
import templateRoutes from './api/v1/templates/routes.js';
import datasetRoutes from './api/v1/datasets/routes.js';
import generationRoutes from './api/v1/generations/routes.js';
import analyticsRoutes from './api/v1/analytics/routes.js';
import promptRoutes from './api/v1/prompts/routes.js';
import userRoutes from './api/v1/users/routes.js';
import csvRoutes from './api/v1/routes/csv.routes.js';
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/generations', generationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/prompts', promptRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/csv', csvRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});