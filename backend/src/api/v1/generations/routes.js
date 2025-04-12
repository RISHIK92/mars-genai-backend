import { Router } from 'express';
import { validateGeneration } from '../../../utils/validators.js';
import generationService from '../../../services/generation/generation.service.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
      const { error } = validateGeneration(req.body);
      if (error) {
        console.warn('Validation Error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
  
      console.log('✅ Request validated.');
      console.log('📥 Body:', req.body);
      console.log('🙋‍♂️ User:', req.user); // Debug user
  
      const generation = await generationService.createGeneration(
        req.user?.id,  // Make sure req.user exists
        req.body
      );
  
      console.log("✅ Generation created successfully.");
  
      res.status(201).json({
        message: 'Generation created successfully',
        generation,
      });
    } catch (error) {
      console.error('❌ Error in generation POST:', error); // Full error
      res.status(500).json({
        error: 'Internal server error',
        message: error.message // Temporarily show real error
      });
    }
  });
  

// Get user's generations
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await generationService.getGenerations(
      req.user.id,
      page,
      limit
    );

    res.json(result);
  } catch (error) {
    _error('Error getting generations:', error);
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
    _error('Error getting generation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 