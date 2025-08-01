const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'url-shortener' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'debug' and below to requests.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'requests.log'), 
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom logging middleware function
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || generateRequestId()
  });

  // Log request body for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    logger.debug('Request body', {
      method: req.method,
      url: req.url,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Response sent', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    });

    // Log error responses
    if (res.statusCode >= 400) {
      logger.error('Error response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        error: chunk ? chunk.toString() : 'No error details',
        timestamp: new Date().toISOString()
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Helper function to generate request ID
function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Export both the logger instance and the middleware function
module.exports = {
  logger,
  loggingMiddleware
};

// For backward compatibility, export the middleware as the default export
module.exports.logger = loggingMiddleware; 