import aiService from '../ai/ai.service.js';
import logger from '../../utils/logger.js';
import Queue from 'bull';
const generationQueue = new Queue('generation', process.env.REDIS_URL);

const generations = [];
const analytics = [];

class GenerationService {
  async createGeneration(userId, { prompt, model, parameters }) {
    try {
      if (!userId) throw new Error('User ID is required');

      logger.info('Creating generation record', { userId, model });

      const generation = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        prompt,
        model,
        parameters,
        status: 'PENDING',
        startTime: new Date(),
        userId,
      };

      generations.push(generation);

      try {
        const result = await aiService.generateContent(prompt, model, parameters);

        generation.content = result.content;
        generation.result = result.result;
        generation.status = 'COMPLETED';
        generation.endTime = new Date();
        generation.metadata = result.metadata || {};

        analytics.push({
          type: 'GENERATION',
          action: 'GENERATE',
          userId,
          generationId: generation.id,
          tokensUsed: 0,
          cost: 0,
          metadata: {
            model,
            parameters,
            promptLength: prompt.length,
          }
        });

        return generation;
      } catch (error) {
        generation.status = 'FAILED';
        generation.error = error.message;
        generation.endTime = new Date();

        analytics.push({
          type: 'GENERATION',
          action: 'GENERATE',
          userId,
          generationId: generation.id,
          tokensUsed: 0,
          cost: 0,
          metadata: {
            model,
            parameters,
            promptLength: prompt.length,
            error: error.message,
          }
        });

        throw new Error(`Generation failed: ${error.message}`);
      }
    } catch (error) {
      logger.error('Error in createGeneration:', error);
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  async getGenerations(userId, page = 1, limit = 10) {
    try {
      if (!userId) throw new Error('User ID is required');

      const userGenerations = generations.filter(g => g.userId === userId);
      const total = userGenerations.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = userGenerations
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice((page - 1) * limit, page * limit);

      return {
        generations: paginated,
        pagination: { total, page, limit, totalPages }
      };
    } catch (error) {
      logger.error('Error in getGenerations:', error);
      throw new Error(`Failed to get generations: ${error.message}`);
    }
  }

  async getGenerationById(userId, generationId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const generation = generations.find(g => g.id === generationId && g.userId === userId);
      if (!generation) throw new Error('Generation not found');

      return generation;
    } catch (error) {
      logger.error('Error in getGenerationById:', error);
      throw error;
    }
  }
}

export default new GenerationService();
