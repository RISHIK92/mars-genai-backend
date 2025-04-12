import { providers, models, capabilities } from '../../config/ai-providers.js';
import promptAnalyzerService from './promptAnalyzer.service.js';

class AIService {
  async generateContent(prompt, template = null) {
    try {
      // Analyze the prompt to determine the best provider
      const analysis = await promptAnalyzerService.analyzePrompt(prompt);
      const { category, specificCategory, recommendedProviders } = analysis;

      // Select the first recommended provider
      const provider = recommendedProviders[0];

      // Generate content based on the category
      switch (category) {
        case 'text':
          return await this.generateText(prompt, provider, specificCategory, template);
        case 'image':
          return await this.generateImage(prompt, provider, specificCategory);
        default:
          throw new Error('Unsupported content category');
      }
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async generateText(prompt, provider, category, template) {
    try {
      const model = models[provider].text[category];
      let response;

      switch (provider) {
        case 'openai':
          response = await providers.openai.chat.completions.create({
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
      _error('Error generating text:', error);
      throw error;
    }
  }

  async generateImage(prompt, provider, category) {
    try {
      const model = models[provider].image[category];
      let response;

      switch (provider) {
        case 'stability':
          response = await providers.stability.generate({
            prompt,
            model,
            width: 1024,
            height: 1024,
            samples: 1,
          });
          return response.artifacts[0].base64;

        case 'replicate':
          response = await providers.replicate.run(model, {
            input: {
              prompt,
              width: 1024,
              height: 1024,
              num_outputs: 1,
            },
          });
          return response[0];

        default:
          throw new Error('Unsupported image generation provider');
      }
    } catch (error) {
      _error('Error generating image:', error);
      throw error;
    }
  }

  async analyzeDataset(dataset) {
    try {
      // Use OpenAI to analyze the dataset content
      const response = await providers.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following dataset and determine its type and best use case. Return a JSON object with type and useCase fields.',
          },
          {
            role: 'user',
            content: dataset,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return {
        type: analysis.type,
        useCase: analysis.useCase,
        recommendedProviders: this.getRecommendedProvidersForDataset(analysis.type),
      };
    } catch (error) {
      _error('Error analyzing dataset:', error);
      throw error;
    }
  }

  getRecommendedProvidersForDataset(type) {
    switch (type.toLowerCase()) {
      case 'text':
        return capabilities.text.general;
      case 'image':
        return capabilities.image.general;
      case 'code':
        return ['openai'];
      case 'research':
        return ['anthropic'];
      default:
        return ['openai', 'anthropic'];
    }
  }
}

const aiService = new AIService();
export default aiService;