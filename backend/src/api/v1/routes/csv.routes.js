import express from 'express';
import csvController from '../controllers/csv.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/parse', csvController.parseCSV);

router.post('/generate', csvController.generateCSV);

router.post('/analyze', csvController.analyzeCSV);

export default router;