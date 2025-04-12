import { OpenAI } from 'openai';
import { config } from '../../config/config.js';
import logger from '../../utils/logger.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

class PromptAnalyzerService {
  async analyzePrompt(prompt) {
    try {
      const category = await this.determineSpecificCategory(prompt);
      const providers = await this.getRecommendedProviders(category);
      
      return {
        category,
        providers,
        confidence: 0.8
      };
    } catch (error) {
      logger.error('Error analyzing prompt:', error);
      throw new Error(`Prompt analysis failed: ${error.message}`);
    }
  }

  async determineSpecificCategory(prompt) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following prompt and determine its specific category. Categories: general, coding, creative, research, image_generation'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      });

      return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      logger.error('Error determining category:', error);
      throw new Error(`Category determination failed: ${error.message}`);
    }
  }

  getRecommendedProviders(category) {
    const providerMap = {
      general: ['openai', 'anthropic'],
      coding: ['openai'],
      creative: ['anthropic'],
      research: ['anthropic'],
      image_generation: ['stability', 'replicate']
    };

    return providerMap[category] || ['openai'];
  }
}

export default new PromptAnalyzerService(); 