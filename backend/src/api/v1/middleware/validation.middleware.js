import { body, validationResult } from 'express-validator';
import logger from '../../../utils/logger.js';

export const validateRegister = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('name').notEmpty().withMessage('Name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in register:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in login:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateDataset = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional(),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['text', 'image', 'code', 'research']).withMessage('Invalid dataset type'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in dataset:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validatePrompt = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional(),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['text', 'code', 'image']).withMessage('Invalid prompt type'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in prompt:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateUser = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('bio').optional(),
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in user profile:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
]; 