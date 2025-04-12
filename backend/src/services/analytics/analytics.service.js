import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AnalyticsService {
  async getUserAnalytics(userId, startDate, endDate) {
    try {
      const analytics = await prisma.analytics.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          generation: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const summary = {
        totalGenerations: analytics.length,
        totalTokens: analytics.reduce((sum, a) => sum + a.tokensUsed, 0),
        totalCost: analytics.reduce((sum, a) => sum + a.cost, 0),
        averageTokensPerGeneration: analytics.length > 0
          ? Math.round(analytics.reduce((sum, a) => sum + a.tokensUsed, 0) / analytics.length)
          : 0,
      };

      return {
        analytics,
        summary,
      };
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async getUsageTrends(userId, period = '30d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const analytics = await prisma.analytics.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const dailyData = {};
      analytics.forEach(a => {
        const date = a.createdAt.toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            generations: 0,
            tokens: 0,
            cost: 0,
          };
        }
        dailyData[date].generations += 1;
        dailyData[date].tokens += a.tokensUsed;
        dailyData[date].cost += a.cost;
      });

      const trends = Object.values(dailyData).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      return {
        period,
        startDate,
        endDate,
        trends,
      };
    } catch (error) {
      _error('Error getting usage trends:', error);
      throw error;
    }
  }

  async getTemplateAnalytics(userId, templateId) {
    try {
      const analytics = await prisma.analytics.findMany({
        where: {
          generation: {
            userId,
            templateId,
          },
        },
        include: {
          generation: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const summary = {
        totalUses: analytics.length,
        totalTokens: analytics.reduce((sum, a) => sum + a.tokensUsed, 0),
        totalCost: analytics.reduce((sum, a) => sum + a.cost, 0),
        averageTokensPerUse: analytics.length > 0
          ? Math.round(analytics.reduce((sum, a) => sum + a.tokensUsed, 0) / analytics.length)
          : 0,
      };

      return {
        analytics,
        summary,
      };
    } catch (error) {
      _error('Error getting template analytics:', error);
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();
export const getUserAnalytics = analyticsService.getUserAnalytics.bind(analyticsService);
export const getUsageTrends = analyticsService.getUsageTrends.bind(analyticsService);
export const getTemplateAnalytics = analyticsService.getTemplateAnalytics.bind(analyticsService); 