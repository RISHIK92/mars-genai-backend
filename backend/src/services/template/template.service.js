import { PrismaClient } from '@prisma/client';
import { info, error as _error } from '../../utils/logger.js';

const prisma = new PrismaClient();

class TemplateService {
  async createTemplate(userId, data) {
    try {
      const template = await prisma.template.create({
        data: {
          ...data,
          userId,
        },
      });

      info(`Template created: ${template.id}`);

      return template;
    } catch (error) {
      _error('Error creating template:', error);
      throw error;
    }
  }

  async getTemplates(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma.template.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.template.count({ where: { userId } }),
      ]);

      return {
        templates,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      _error('Error getting templates:', error);
      throw error;
    }
  }

  async getTemplateById(userId, templateId) {
    try {
      const template = await prisma.template.findFirst({
        where: {
          id: templateId,
          userId,
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    } catch (error) {
      _error('Error getting template:', error);
      throw error;
    }
  }

  async updateTemplate(userId, templateId, data) {
    try {
      const template = await prisma.template.findFirst({
        where: {
          id: templateId,
          userId,
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      const updatedTemplate = await prisma.template.update({
        where: { id: templateId },
        data,
      });

      info(`Template updated: ${templateId}`);

      return updatedTemplate;
    } catch (error) {
      _error('Error updating template:', error);
      throw error;
    }
  }

  async deleteTemplate(userId, templateId) {
    try {
      const template = await prisma.template.findFirst({
        where: {
          id: templateId,
          userId,
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      await prisma.template.delete({
        where: { id: templateId },
      });

      info(`Template deleted: ${templateId}`);

      return { message: 'Template deleted successfully' };
    } catch (error) {
      _error('Error deleting template:', error);
      throw error;
    }
  }
}

export default new TemplateService(); 