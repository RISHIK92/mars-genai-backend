import { providers, promptAnalysis } from '../../config/ai-providers.js';

class PromptAnalyzerService {
  async analyzePrompt(prompt) {
    try {
      const isImagePrompt = this.isImagePrompt(prompt);
      const category = isImagePrompt ? 'image' : 'text';

      // Analyze the prompt to determine the specific category
      const specificCategory = await this.determineSpecificCategory(prompt, category);

      // Get the recommended providers for this category
      const recommendedProviders = this.getRecommendedProviders(category, specificCategory);

      return {
        category,
        specificCategory,
        recommendedProviders,
      };
    } catch (error) {
      console.log(error)
    }
  }

  isImagePrompt(prompt) {
    const imageKeywords = ['image', 'picture', 'photo', 'draw', 'paint', 'visual'];
    const lowerPrompt = prompt.toLowerCase();
    return imageKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  async determineSpecificCategory(prompt, category) {
    try {
      // Use OpenAI to analyze the prompt for more accurate categorization
      const response = await providers.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze the following prompt and categorize it into one of these categories: ${promptAnalysis.categories[category].join(', ')}. Return only the category name.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const determinedCategory = response.choices[0].message.content.toLowerCase().trim();

      // Validate the determined category
      if (promptAnalysis.categories[category].includes(determinedCategory)) {
        return determinedCategory;
      }

      // Fallback to keyword-based analysis if OpenAI's response is invalid
      return this.analyzeByKeywords(prompt, category);
    } catch (error) {
        console.log(error)
      return this.analyzeByKeywords(prompt, category);
    }
  }

  analyzeByKeywords(prompt, category) {
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(promptAnalysis.keywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return cat;
      }
    }

    return 'general';
  }

  getRecommendedProviders(category, specificCategory) {
    const { capabilities } = require('../../config/ai-providers');
    return capabilities[category][specificCategory] || capabilities[category].general;
  }
}

export default new PromptAnalyzerService(); 