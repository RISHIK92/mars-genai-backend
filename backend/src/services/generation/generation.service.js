import { PrismaClient } from '@prisma/client';
import aiService from '../ai/ai.service.js';
import logger from '../../utils/logger.js';
import Queue from 'bull';
const generationQueue = new Queue('generation', process.env.REDIS_URL);

const prisma = new PrismaClient();

class GenerationService {
  async createGeneration(userId, { prompt, model, parameters }) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      logger.info('Creating generation record', { userId, model });

      const generation = await prisma.generation.create({
        data: {
          prompt,
          model,
          parameters,
          status: 'PENDING',
          startTime: new Date(),
          user: {
            connect: { id: userId }
          }
        }
      });

      try {
        const result = await aiService.generateContent(prompt, model, parameters);

        const updatedGeneration = await prisma.generation.update({
          where: { id: generation.id },
          data: {
            content: result.content,
            result: result.result,
            status: 'COMPLETED',
            endTime: new Date(),
            metadata: result.metadata || {}
          }
        });

        await prisma.analytics.create({
          data: {
            type: 'GENERATION',
            action: 'GENERATE',
            userId: userId,
            generationId: generation.id,
            tokensUsed: 0,
            cost: 0,
            metadata: {
              model: model,
              parameters: parameters,
              promptLength: prompt.length
            }
          }
        });

        return updatedGeneration;
      } catch (error) {
        logger.error('AI generation failed:', error);
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: 'FAILED',
            error: error.message,
            endTime: new Date()
          }
        });

        await prisma.analytics.create({
          data: {
            type: 'GENERATION',
            action: 'GENERATE',
            userId: userId,
            generationId: generation.id,
            tokensUsed: 0,
            cost: 0,
            metadata: {
              model: model,
              parameters: parameters,
              promptLength: prompt.length,
              error: error.message
            }
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
      if (!userId) {
        throw new Error('User ID is required');
      }

      const skip = (page - 1) * limit;

      const [generations, total] = await Promise.all([
        prisma.generation.findMany({
          where: {
            user: {
              id: userId
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.generation.count({
          where: {
            user: {
              id: userId
            }
          }
        })
      ]);

      return {
        generations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error in getGenerations:', error);
      throw new Error(`Failed to get generations: ${error.message}`);
    }
  }

  async getGenerationById(userId, generationId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const generation = await prisma.generation.findFirst({
        where: {
          id: generationId,
          user: {
            id: userId
          }
        }
      });

      if (!generation) {
        throw new Error('Generation not found');
      }

      return generation;
    } catch (error) {
      logger.error('Error in getGenerationById:', error);
      throw error;
    }
  }
}

export default new GenerationService(); 