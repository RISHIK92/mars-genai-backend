import { Router } from 'express';
import { getUserAnalytics, getUsageTrends, getTemplateAnalytics } from '../../../services/analytics/analytics.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

// Get user analytics
router.get('/', async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    const result = await getUserAnalytics(
      req.user.userId,
      startDate,
      endDate
    );

    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get usage trends
router.get('/trends', async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const result = await getUsageTrends(
      req.user.id,
      period
    );

    res.json(result);
  } catch (error) {
    console.log('Error getting usage trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get template analytics
router.get('/templates/:templateId', async (req, res) => {
  try {
    const result = await getTemplateAnalytics(
      req.user.id,
      req.params.templateId
    );

    res.json(result);
  } catch (error) {
    _error('Error getting template analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;