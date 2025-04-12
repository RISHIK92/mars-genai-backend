import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export const error = (message, ...args) => {
  logger.error(message, ...args);
};

export const info = (message, ...args) => {
  logger.info(message, ...args);
};

export const warn = (message, ...args) => {
  logger.warn(message, ...args);
};

export const debug = (message, ...args) => {
  logger.debug(message, ...args);
};

export default logger;
