import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  deleteUser,
  changePassword
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateUser } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateUser, registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(authenticateToken);
router.get('/profile', getUserProfile);
router.put('/profile', validateUser, updateUserProfile);
router.delete('/profile', deleteUser);
router.put('/change-password', changePassword);

export default router;