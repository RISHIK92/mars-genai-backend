import { Router } from 'express';
import { validateTemplate } from '../../../utils/validators.js';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware.js';
const prisma = new PrismaClient();
const router = Router();

router.use(authenticateToken);

router.post('/', async (req, res) => {
  try {
    const { error } = validateTemplate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const template = await prisma.template.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: 'Template created successfully',
      template,
    });
  } catch (error) {
    _error('Error creating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.template.count({ where: { userId: req.user.id } }),
    ]);

    res.json({
      templates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log('Error getting templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    _error('Error getting template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { error } = validateTemplate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const template = await prisma.template.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const updatedTemplate = await prisma.template.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      message: 'Template updated successfully',
      template: updatedTemplate,
    });
  } catch (error) {
    _error('Error updating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await prisma.template.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    _error('Error deleting template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 