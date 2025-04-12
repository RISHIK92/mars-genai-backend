import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import logger from '../../utils/logger.js';

class CSVService {
  async parseCSV(csvData) {
    try {
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      logger.info('CSV parsed successfully', { 
        recordCount: records.length,
        columns: Object.keys(records[0] || {})
      });
      
      return {
        data: records,
        metadata: {
          recordCount: records.length,
          columns: Object.keys(records[0] || {}),
          sample: records.slice(0, 5)
        }
      };
    } catch (error) {
      logger.error('Error parsing CSV:', error);
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }

  async generateCSV(data) {
    try {
      const csv = stringify(data, {
        header: true,
        columns: Object.keys(data[0] || {})
      });
      
      logger.info('CSV generated successfully', { 
        recordCount: data.length,
        columns: Object.keys(data[0] || {})
      });
      
      return csv;
    } catch (error) {
      logger.error('Error generating CSV:', error);
      throw new Error(`CSV generation failed: ${error.message}`);
    }
  }

  async analyzeCSV(csvData) {
    try {
      const { data, metadata } = await this.parseCSV(csvData);
      
      const analysis = {
        recordCount: metadata.recordCount,
        columns: metadata.columns,
        columnTypes: {},
        sampleData: metadata.sample,
        statistics: {}
      };
      
      metadata.columns.forEach(column => {
        const values = data.map(row => row[column]);
        const numericValues = values.filter(v => !isNaN(v));
        
        analysis.columnTypes[column] = numericValues.length === values.length ? 
          'numeric' : 'text';
          
        if (analysis.columnTypes[column] === 'numeric') {
          analysis.statistics[column] = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          };
        }
      });
      
      logger.info('CSV analysis completed', { 
        analysis: {
          recordCount: analysis.recordCount,
          columns: analysis.columns.length
        }
      });
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing CSV:', error);
      throw new Error(`CSV analysis failed: ${error.message}`);
    }
  }
}

const csvService = new CSVService();
export default csvService; 