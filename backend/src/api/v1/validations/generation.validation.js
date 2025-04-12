import Joi from 'joi';

export const createGenerationSchema = Joi.object({
  prompt: Joi.string().required(),
  model: Joi.string().required(),
  parameters: Joi.object({
    temperature: Joi.number().min(0).max(2).default(0.7),
    maxTokens: Joi.number().integer().min(1).default(100),
    topP: Joi.number().min(0).max(1).default(1),
    frequencyPenalty: Joi.number().min(-2).max(2).default(0),
    presencePenalty: Joi.number().min(-2).max(2).default(0),
    width: Joi.number().integer().min(256).max(2048).default(1024),
    height: Joi.number().integer().min(256).max(2048).default(1024),
    samples: Joi.number().integer().min(1).max(4).default(1)
  }).default({})
});

export const getGenerationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
}); 