import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../middleware/validation.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/me', authenticateToken, authController.updateUser);
router.delete('/me', authenticateToken, authController.deleteUser);

export default router;