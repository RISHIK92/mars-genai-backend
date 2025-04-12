import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import pkg from 'stability-ai';
const { generateAsync } = pkg;
import Replicate from 'replicate'; // Import directly, not destructured
import { config } from './config.js';

const providers = {
  openai: new OpenAI({
    apiKey: config.openaiApiKey,
  }),
  anthropic: new Anthropic({
    apiKey: config.anthropicApiKey,
  }),
  stability: {
    generate: (params) => generateAsync({
      apiKey: config.stabilityApiKey,
      ...params
    }),
  },
  replicate: new Replicate({
    auth: config.replicateApiToken,
  }),
};

const capabilities = {
  text: {
    general: ['openai', 'anthropic'],
    research: ['anthropic'],
    coding: ['openai'],
    creative: ['anthropic'],
  },
  image: {
    general: ['stability', 'replicate'],
    realistic: ['stability'],
    artistic: ['replicate'],
  },
};

const models = {
  openai: {
    text: {
      general: 'gpt-4',
      coding: 'gpt-4',
      creative: 'gpt-4',
    },
    image: {
      general: 'dall-e-3',
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
