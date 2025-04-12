import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
logger.info('Loading environment variables from:', { envPath });

const result = dotenv.config({ path: envPath });
if (result.error) {
  logger.error('Error loading .env file:', result.error);
  throw result.error;
}

// Log summary
logger.info('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  hasGeminiKey: !!process.env.GEMINI_API_KEY,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasDbUrl: !!process.env.DATABASE_URL
});

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  geminiApiKey: process.env.GEMINI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  stabilityApiKey: process.env.STABILITY_API_KEY,
  replicateApiToken: process.env.REPLICATE_API_TOKEN,
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  analyticsEnabled: process.env.ANALYTICS_ENABLED === 'true',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
};

// Required env vars mapping
const requiredEnvVarsMap = {
  GEMINI_API_KEY: config.geminiApiKey,
  JWT_SECRET: config.jwtSecret,
  DATABASE_URL: config.databaseUrl,
};

for (const [envVar, value] of Object.entries(requiredEnvVarsMap)) {
  if (!value) {
    logger.error('Missing required environment variable:', {
      variable: envVar,
      currentValue: value,
    });
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export { config };
