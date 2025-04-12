import { PrismaClient } from '@prisma/client';
import aiService from '../../../services/ai/ai.service.js';
import logger from '../../../utils/logger.js';

const prisma = new PrismaClient();

export const createPrompt = async (req, res) => {
  try {
    const { name, description, content, category, template } = req.body;
    const userId = req.user.id;
    console.log(userId)

    const prompt = await prisma.prompt.create({
      data: {
        name,
        description,
        content,
        category,
        template,
        userId
      }
    });

    logger.info(`Prompt created successfully: ${prompt.id}`);
    res.status(201).json(prompt);
  } catch (error) {
    logger.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPrompts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const prompts = await prisma.prompt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(prompts);
  } catch (error) {
    logger.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const prompt = await prisma.prompt.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(prompt);
  } catch (error) {
    logger.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, description, content, category, template } = req.body;

    const prompt = await prisma.prompt.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        name,
        description,
        content,
        category,
        template
      }
    });

    logger.info(`Prompt updated successfully: ${updatedPrompt.id}`);
    res.json(updatedPrompt);
  } catch (error) {
    logger.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const prompt = await prisma.prompt.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    await prisma.prompt.delete({
      where: { id }
    });

    logger.info(`Prompt deleted successfully: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { template } = req.body;

    const prompt = await prisma.prompt.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const generatedContent = await aiService.generateContent(prompt.content, template || prompt.template);

    logger.info(`Content generated successfully for prompt: ${id}`);
    res.json({
      prompt: prompt.content,
      generatedContent
    });
  } catch (error) {
    logger.error('Error generating content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generatePrompt = async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    const userId = req.user.id;

    let template = null;
    if (templateId) {
      template = await prisma.template.findFirst({
        where: {
          id: templateId,
          userId,
        },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
    }

    const content = await aiService.generateContent(prompt, template?.content);

    const generation = await prisma.generation.create({
      data: {
        userId,
        prompt,
        content,
        templateId,
        status: 'COMPLETED',
      },
    });

    logger.info(`Prompt generated successfully: ${generation.id}`);
    res.json({
      message: 'Prompt generated successfully',
      generation,
    });
  } catch (error) {
    logger.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 