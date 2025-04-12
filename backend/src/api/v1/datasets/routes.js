import express from 'express';
import { 
  createDataset, 
  getDatasets, 
  getDatasetById, 
  updateDataset, 
  deleteDataset,
  analyzeDataset
} from '../controllers/dataset.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDataset } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all datasets for the authenticated user
router.get('/', getDatasets);

// Get a specific dataset
router.get('/:id', getDatasetById);

// Create a new dataset
router.post('/', validateDataset, createDataset);

// Update a dataset
router.put('/:id', validateDataset, updateDataset);

// Delete a dataset
router.delete('/:id', deleteDataset);

// Analyze dataset
router.post('/:id/analyze', analyzeDataset);

export default router; 