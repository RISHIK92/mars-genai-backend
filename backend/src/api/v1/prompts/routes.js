import express from 'express';
import { 
  createPrompt, 
  getPrompts, 
  getPromptById, 
  updatePrompt, 
  deletePrompt,
  generateContent
} from '../controllers/prompt.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validatePrompt } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPrompts);

router.get('/:id', getPromptById);

router.post('/', validatePrompt, createPrompt);

router.put('/:id', validatePrompt, updatePrompt);

router.delete('/:id', deletePrompt);

router.post('/:id/generate', generateContent);

export default router;