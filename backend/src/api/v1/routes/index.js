import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import promptRoutes from './prompt.routes.js';
import generationRoutes from './generation.routes.js';
import analyticsRoutes from './analytics.routes.js';
import csvRoutes from './csv.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/prompts', promptRoutes);
router.use('/generations', generationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/csv', csvRoutes);

export default router;