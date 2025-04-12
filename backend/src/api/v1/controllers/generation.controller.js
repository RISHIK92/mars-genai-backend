import generationService from '../../../services/generation/generation.service.js';
import logger from '../../../utils/logger.js';

class GenerationController {
  async createGeneration(req, res) {
    try {
      const { prompt, model, parameters } = req.body;
      
      // Ensure user is authenticated and has an ID
      if (!req.user || !req.user.id) {
        logger.error('No user ID found in request');
        return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
      }

      const userId = req.user.id;
      logger.info(`Creating generation for user ${userId}`);

      const generation = await generationService.createGeneration(userId, {
        prompt,
        model,
        parameters,
      });

      res.status(201).json({
        message: 'Generation created successfully',
        generation,
      });
    } catch (error) {
      logger.error('Error creating generation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getGenerations(req, res) {
    try {
      // Ensure user is authenticated and has an ID
      if (!req.user || !req.user.id) {
        logger.error('No user ID found in request');
        return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
      }

      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      logger.info(`Getting generations for user ${userId}, page ${page}, limit ${limit}`);

      const result = await generationService.getGenerations(userId, page, limit);
      res.json(result);
    } catch (error) {
      logger.error('Error getting generations:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new GenerationController(); 