import aiService from '../../../services/ai/ai.service.js';
import logger from '../../../utils/logger.js';

export const createPrompt = async (req, res) => {
  try {
    const { name, description, content, category, template } = req.body;
    const userId = req.user.id;

    const prompt = {
      id: 'mock-id',
      name,
      description,
      content,
      category,
      template,
      userId,
    };

    logger.info(`Prompt created successfully: ${prompt.id}`);
    res.status(201).json(prompt);
  } catch (error) {
    logger.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPrompts = async (req, res) => {
  try {
    const prompts = [
      {
        id: 'mock-id-1',
        name: 'Sample Prompt',
        description: 'Mock description',
        content: 'Mock content',
        category: 'General',
        template: 'Default',
        userId: req.user.userId,
      },
    ];

    res.json(prompts);
  } catch (error) {
    logger.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = {
      id,
      name: 'Sample Prompt',
      description: 'Mock description',
      content: 'Mock content',
      category: 'General',
      template: 'Default',
      userId: req.user.userId,
    };

    res.json(prompt);
  } catch (error) {
    logger.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, category, template } = req.body;

    const updatedPrompt = {
      id,
      name,
      description,
      content,
      category,
      template,
      userId: req.user.userId,
    };

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
    const { template } = req.body;

    const promptContent = 'Mock content for prompt generation';

    const generatedContent = await aiService.generateContent(promptContent, template || 'Default');

    logger.info(`Content generated successfully for prompt: ${id}`);
    res.json({
      prompt: promptContent,
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

    const templateContent = templateId ? `Mock template ${templateId}` : null;
    const content = await aiService.generateContent(prompt, templateContent);

    const generation = {
      id: 'mock-generation-id',
      userId: req.user.id,
      prompt,
      content,
      templateId,
      status: 'COMPLETED',
    };

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
