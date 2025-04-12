import express from 'express';
import { register, login, getCurrentUser, updateUser, deleteUser } from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../middleware/validation.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/me', authenticateToken, updateUser);
router.delete('/me', authenticateToken, deleteUser);

export default router; 