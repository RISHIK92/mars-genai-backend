import express from 'express';
import generationController from '../controllers/generation.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new generation
router.post('/', generationController.createGeneration);

// Get user's generations
router.get('/', generationController.getGenerations);

export default router; 