import Joi from'joi';

const validateRegistration = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    company: Joi.string().allow('').optional(),
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateTemplate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    content: Joi.string().required(),
    type: Joi.string().valid(
      'BLOG_POST',
      'PRODUCT_DESCRIPTION',
      'SOCIAL_MEDIA',
      'EMAIL',
      'AD_COPY',
      'CUSTOM'
    ).required(),
  });

  return schema.validate(data);
};

const validateGeneration = (data) => {
  const schema = Joi.object({
    prompt: Joi.string().required(),
    templateId: Joi.string().uuid().optional(),
    model: Joi.string().optional(),
    parameters: Joi.object({
      temperature: Joi.number().min(0).max(1).optional(),
      max_tokens: Joi.number().integer().min(1).optional(),
      // Add other parameter validations as needed
    }).optional(),
  });

  return schema.validate(data);
};

const validateDataset = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    content: Joi.string().required(),
    type: Joi.string().valid('TEXT', 'IMAGE', 'CODE', 'RESEARCH').required()
  });

  return schema.validate(data);
};

export { validateRegistration, validateLogin, validateTemplate, validateGeneration, validateDataset };
