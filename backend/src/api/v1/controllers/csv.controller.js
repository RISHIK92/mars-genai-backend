import csvService from '../../../services/data/csv.service.js';
import logger from '../../../utils/logger.js';

class CSVController {
  async parseCSV(req, res) {
    try {
      const { csvData } = req.body;
      
      if (!csvData) {
        return res.status(400).json({
          success: false,
          error: 'CSV data is required'
        });
      }
      
      const result = await csvService.parseCSV(csvData);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error parsing CSV:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async generateCSV(req, res) {
    try {
      const { data } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Valid data array is required'
        });
      }
      
      const csv = await csvService.generateCSV(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
      
      return res.status(200).send(csv);
    } catch (error) {
      logger.error('Error generating CSV:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async analyzeCSV(req, res) {
    try {
      const { csvData } = req.body;
      
      if (!csvData) {
        return res.status(400).json({
          success: false,
          error: 'CSV data is required'
        });
      }
      
      const analysis = await csvService.analyzeCSV(csvData);
      
      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing CSV:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CSVController(); 