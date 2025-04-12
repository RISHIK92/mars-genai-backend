import { PrismaClient } from '@prisma/client';
import aiService from '../../../services/ai/ai.service.js';
import logger from '../../../utils/logger.js';

const prisma = new PrismaClient();

export const createDataset = async (req, res) => {
  try {
    const { name, description, content, type } = req.body;
    const userId = req.user.userId;

    // Convert type to uppercase to match Prisma enum
    const prismaType = type.toUpperCase();

    const dataset = await prisma.dataset.create({
      data: {
        name,
        description,
        content,
        type: prismaType,
        userId
      }
    });

    logger.info(`Dataset created successfully: ${dataset.id}`);
    res.status(201).json(dataset);
  } catch (error) {
    logger.error('Error creating dataset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDatasets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const datasets = await prisma.dataset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(datasets);
  } catch (error) {
    logger.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const dataset = await prisma.dataset.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json(dataset);
  } catch (error) {
    logger.error('Error fetching dataset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, description, content, type } = req.body;

    const dataset = await prisma.dataset.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const updatedDataset = await prisma.dataset.update({
      where: { id },
      data: {
        name,
        description,
        content,
        type
      }
    });

    logger.info(`Dataset updated successfully: ${updatedDataset.id}`);
    res.json(updatedDataset);
  } catch (error) {
    logger.error('Error updating dataset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const dataset = await prisma.dataset.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    await prisma.dataset.delete({
      where: { id }
    });

    logger.info(`Dataset deleted successfully: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting dataset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const analyzeDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const dataset = await prisma.dataset.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const analysis = await aiService.analyzeDataset(dataset);
    const recommendedProviders = aiService.getRecommendedProvidersForDataset(analysis.type);

    logger.info(`Dataset analyzed successfully: ${id}`);
    res.json({
      analysis,
      recommendedProviders
    });
  } catch (error) {
    logger.error('Error analyzing dataset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 