const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger } = require('./middleware/logging');
const shortUrlRoutes = require('./routes/shortUrlRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware (MANDATORY requirement)
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'URL Shortener Service is running' });
});

// API routes
app.use('/shorturls', shortUrlRoutes);

// Redirect endpoint for short URLs
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    const shortUrlService = require('./services/shortUrlService');
    const result = await shortUrlService.redirectToOriginal(shortcode, req);
    
    if (result.success) {
      res.redirect(result.originalUrl);
    } else {
      res.status(404).json({ error: 'Short URL not found or expired' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 URL Shortener Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/shorturls`);
});

module.exports = app; 