import { Router } from 'express';
import { validateGeneration } from '../../../utils/validators.js';
import generationService from '../../../services/generation/generation.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import logger from '../../../utils/logger.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/', async (req, res) => {
    try {
      const { error } = validateGeneration(req.body);

      if (error) {
        logger.warn('Validation Error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }

      logger.info('Creating generation:', {
        model: req.body.model,
        prompt: req.body.prompt,
        parameters: req.body.parameters,
        userId: req.user.id
      });
  
      const generation = await generationService.createGeneration(
        req.user.id,
        req.body
      );
  
      logger.info('Generation created successfully:', { generationId: generation.id });
  
      res.status(201).json({
        message: 'Generation created successfully',
        generation,
      });
    } catch (error) {
      logger.error('Error in generation POST:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });
  

// Get user's generations
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    console.log(req.user)
    logger.info('Getting generations:', {
      userId: req.user.userId,
      page,
      limit
    });

    const result = await generationService.getGenerations(
      req.user.id,
      page,
      limit
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting generations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific generation
router.get('/:id', async (req, res) => {
  try {
    const generation = await generationService.getGenerationById(
      req.user.id,
      req.params.id
    );

    res.json(generation);
  } catch (error) {
    if (error.message === 'Generation not found') {
      return res.status(404).json({ error: 'Generation not found' });
    }
    logger.error('Error getting generation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;