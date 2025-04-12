import { PrismaClient } from '@prisma/client';
import aiService from '../ai/ai.service.js';
// import { info } from '../../utils/logger.js';
import Queue from 'bull';
const generationQueue = new Queue('generation', process.env.REDIS_URL);

const prisma = new PrismaClient();

class GenerationService {
  async createGeneration(userId, data) {
    try {
      const { prompt, templateId, datasetId } = data;

      let template = null;
      if (templateId) {
        template = await prisma.template.findUnique({
          where: { id: templateId },
        });
        if (!template) {
          throw new Error('Template not found');
        }
      }

      let dataset = null;
      if (datasetId) {
        dataset = await prisma.dataset.findUnique({
          where: { id: datasetId },
        });
        if (!dataset) {
          throw new Error('Dataset not found');
        }
      }

      const content = await aiService.generateContent(prompt, template?.content);

      const generation = await prisma.generation.create({
        data: {
          userId,
          prompt,
          content,
          templateId,
          datasetId,
          status: 'COMPLETED',
        },
      });
      return generation;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async getGenerations(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const generations = await prisma.generation.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          dataset: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      const total = await prisma.generation.count({
        where: { userId },
      });

      return {
        generations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      _error('Error getting generations:', error);
      throw error;
    }
  }

  async getGenerationById(id, userId) {
    try {
      const generation = await prisma.generation.findUnique({
        where: { id },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          dataset: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (!generation) {
        throw new Error('Generation not found');
      }

      if (generation.userId !== userId) {
        throw new Error('Unauthorized access to generation');
      }

      return generation;
    } catch (error) {
      _error('Error getting generation by ID:', error);
      throw error;
    }
  }
}

export default new GenerationService(); 