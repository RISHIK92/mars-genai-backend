import { providers, models, capabilities } from '../../config/ai-providers.js';
import promptAnalyzerService from './promptAnalyzer.service.js';
import { OpenAI } from 'openai';
import { config } from '../../config/config.js';
import logger from '../../utils/logger.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

class AIService {
  async generateContent(prompt, model = 'gemini-2.0-flash-lite-001', parameters = {}) {
    try {
      if (model.includes('stable-diffusion') || model.includes('sdxl')) {
        logger.info('Generating image with Stability AI', { 
          model, 
          parameters
        });

        const response = await providers.stability.generateImage({
          prompt,
          width: parameters.width || 1024,
          height: parameters.height || 1024,
          samples: parameters.samples || 1,
          steps: 30,
          cfg_scale: 7,
          sampler: 'K_DPMPP_2M',
          style_preset: 'photographic'
        });

        if (!response.artifacts || !response.artifacts[0]) {
          throw new Error('No image generated');
        }

        const imageData = response.artifacts[0].base64;
        
        return {
          content: imageData,
          result: JSON.stringify({
            image: imageData,
            metadata: {
              model,
              provider: 'stability',
              parameters
            }
          }),
          metadata: JSON.stringify({
            model,
            provider: 'stability',
            parameters,
            type: 'image'
          })
        };
      }

      logger.info('Generating content with Gemini', { 
        model, 
        parameters,
        hasApiKey: !!providers.gemini.apiKey 
      });

      if (!providers.gemini.apiKey) {
        throw new Error('Gemini API key is not configured');
      }

      const gemini = providers.gemini;
      const modelInstance = gemini.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite-001',
        generationConfig: {
          temperature: parameters.temperature || 0.7,
          maxOutputTokens: parameters.max_tokens || 100,
          topP: parameters.top_p || 0.8,
          topK: parameters.top_k || 40,
        }
      });

      const result = await modelInstance.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }] 
        }]
      });

      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        result: JSON.stringify({
          text,
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          }
        }),
        metadata: JSON.stringify({
          model: 'gemini-2.0-flash-lite-001',
          provider: 'gemini',
          parameters,
        }),
      };
    } catch (error) {
      logger.error('Error generating content:', error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async analyzePrompt(prompt) {
    try {
      logger.info('Analyzing prompt with Gemini');

      const gemini = providers.gemini;
      const model = gemini.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite-001',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
        }
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze this prompt and determine its category (general, research, coding, creative): "${prompt}"`
          }]
        }]
      });

      const response = await result.response;
      const analysis = response.text().toLowerCase();

      return {
        category: this.determineCategory(analysis),
        confidence: 0.9,
      };
    } catch (error) {
      logger.error('Error analyzing prompt:', error);
      throw new Error(`Prompt analysis failed: ${error.message}`);
    }
  }

  determineCategory(analysis) {
    const categories = {
      research: ['research', 'study', 'analyze', 'investigate'],
      coding: ['code', 'program', 'function', 'algorithm'],
      creative: ['story', 'poem', 'creative', 'imagine'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => analysis.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  async generateText(prompt, provider, category, template) {
    try {
      const model = models[provider].text[category];
      let response;

      switch (provider) {
        case 'openai':
          response = await openai.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: template || 'You are a helpful AI assistant.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          });
          return response.choices[0].message.content;

        case 'anthropic':
          response = await providers.anthropic.messages.create({
            model,
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: template ? `${template}\n\n${prompt}` : prompt,
              },
            ],
          });
          return response.content[0].text;

        default:
          throw new Error('Unsupported text generation provider');
      }
    } catch (error) {
      logger.error('Error generating text:', error);
      throw error;
    }
  }

  async generateImage(prompt, provider, category) {
    try {
      const model = models[provider].image[category];
      let response;

      switch (provider) {
        case 'stability':
          response = await providers.stability.generateImage({
            prompt,
            width: 1024,
            height: 1024,
            samples: 1,
            steps: 30,
            cfg_scale: 7,
            style_preset: 'photographic'
          });
          
          if (!response.artifacts || response.artifacts.length === 0) {
            throw new Error('No image generated');
          }
          
          const imageBuffer = Buffer.from(response.artifacts[0].base64, 'base64');
          
          return {
            image: imageBuffer,
            imageUrl: `data:image/png;base64,${response.artifacts[0].base64}`,
            metadata: {
              model: model,
              parameters: {
                width: 1024,
                height: 1024,
                samples: 1,
                steps: 30,
                cfg_scale: 7
              }
            }
          };

        case 'replicate':
          response = await providers.replicate.run(model, {
            input: {
              prompt,
              width: 1024,
              height: 1024,
              num_outputs: 1,
              num_inference_steps: 30,
              guidance_scale: 7.5,
            },
          });
          
          if (!response || response.length === 0) {
            throw new Error('No image generated');
          }
          
          return {
            imageUrl: response[0],
            metadata: {
              model: model,
              parameters: {
                width: 1024,
                height: 1024,
                num_outputs: 1,
                num_inference_steps: 30,
                guidance_scale: 7.5
              }
            }
          };

        default:
          throw new Error('Unsupported image generation provider');
      }
    } catch (error) {
      logger.error('Error generating image:', error);
      throw error;
    }
  }

  async analyzeDataset(dataset) {
    try {
      const gemini = providers.gemini;
      const model = gemini.getGenerativeModel({ 
        model: 'gemini-2.0-flash-lite-001',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
        }
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze this dataset and determine its type (text, image, mixed): "${JSON.stringify(dataset)}"`
          }]
        }]
      });

      const response = await result.response;
      const analysis = response.text().toLowerCase();

      return {
        type: this.determineDatasetType(analysis),
        confidence: 0.9,
      };
    } catch (error) {
      logger.error('Error analyzing dataset:', error);
      throw new Error(`Dataset analysis failed: ${error.message}`);
    }
  }

  determineDatasetType(analysis) {
    const types = {
      text: ['text', 'string', 'paragraph', 'sentence'],
      image: ['image', 'picture', 'photo', 'visual'],
      mixed: ['mixed', 'both', 'combined', 'multiple'],
    };

    for (const [type, keywords] of Object.entries(types)) {
      if (keywords.some(keyword => analysis.includes(keyword))) {
        return type;
      }
    }

    return 'text';
  }

  getRecommendedProvidersForDataset(type) {
    const recommendations = {
      text: ['openai', 'anthropic', 'gemini'],
      image: ['stability', 'replicate'],
      mixed: ['openai', 'anthropic', 'gemini', 'stability', 'replicate'],
    };

    return recommendations[type] || recommendations.text;
  }
}

export default new AIService();