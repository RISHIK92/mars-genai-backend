import express from 'express';
import generationController from '../controllers/generation.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', generationController.createGeneration);

router.get('/', generationController.getGenerations);

export default router; 