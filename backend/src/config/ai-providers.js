import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import Replicate from 'replicate';
import { config } from './config.js';
import logger from '../utils/logger.js';
import { OpenAI } from 'openai';

const gemini = new GoogleGenerativeAI(config.geminiApiKey);
logger.info('Gemini initialized', { hasApiKey: !!config.geminiApiKey });

const stabilityConfig = {
  apiKey: config.stabilityApiKey,
  engine: 'stable-diffusion-xl-1024-v1-0',
  baseUrl: 'https://api.stability.ai/v1'
};

const providers = {
  gemini,
  anthropic: new Anthropic({
    apiKey: config.anthropicApiKey,
  }),
  stability: {
    generateImage: async (params) => {
      try {
        const response = await fetch(`${stabilityConfig.baseUrl}/generation/${stabilityConfig.engine}/text-to-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${stabilityConfig.apiKey}`
          },
          body: JSON.stringify({
            text_prompts: [{ text: params.prompt }],
            cfg_scale: params.cfg_scale || 7,
            height: params.height || 1024,
            width: params.width || 1024,
            samples: params.samples || 1,
            steps: params.steps || 30,
            style_preset: params.style_preset || 'photographic'
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to generate image');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        logger.error('Stability AI API error:', error);
        throw error;
      }
    }
  },
  replicate: new Replicate({
    auth: config.replicateApiToken,
  }),
  openai: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID
  }),
  google: new GoogleGenerativeAI(process.env.GOOGLE_API_KEY),
};

const capabilities = {
  text: {
    general: ['gemini', 'anthropic'],
    research: ['anthropic'],
    coding: ['gemini'],
    creative: ['anthropic'],
  },
  image: {
    general: ['stability', 'replicate'],
    realistic: ['stability'],
    artistic: ['replicate'],
  },
};

const models = {
  gemini: {
    text: {
      general: 'gemini-pro',
      coding: 'gemini-pro',
      creative: 'gemini-pro',
    },
  },
  anthropic: {
    text: {
      general: 'claude-3-opus',
      research: 'claude-3-sonnet',
      creative: 'claude-3-opus',
    },
  },
  stability: {
    image: {
      general: 'stable-diffusion-xl-1024-v1-0',
      realistic: 'stable-diffusion-xl-1024-v1-0',
    },
  },
  replicate: {
    image: {
      general: 'stability-ai/sdxl',
      artistic: 'stability-ai/sdxl',
    },
  },
};

const promptAnalysis = {
  categories: {
    text: ['general', 'research', 'coding', 'creative'],
    image: ['general', 'realistic', 'artistic'],
  },
  keywords: {
    research: ['research', 'study', 'analyze', 'investigate'],
    coding: ['code', 'program', 'function', 'algorithm'],
    creative: ['story', 'poem', 'creative', 'imagine'],
    realistic: ['realistic', 'photo', 'photograph'],
    artistic: ['artistic', 'painting', 'drawing', 'art'],
  },
};

export { providers, capabilities, models, promptAnalysis };
