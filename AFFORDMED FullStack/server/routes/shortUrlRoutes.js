const express = require('express');
const { body, validationResult } = require('express-validator');
const shortUrlController = require('../controllers/shortUrlController');
const { logger } = require('../middleware/logging');

const router = express.Router();

// Validation middleware
const validateCreateShortUrl = [
  body('url')
    .isURL()
    .withMessage('URL must be a valid URL format')
    .notEmpty()
    .withMessage('URL is required'),
  body('validity')
    .optional()
    .isInt({ min: 1, max: 1440 }) // Max 24 hours in minutes
    .withMessage('Validity must be an integer between 1 and 1440 minutes'),
  body('shortcode')
    .optional()
    .isAlphanumeric()
    .isLength({ min: 3, max: 20 })
    .withMessage('Shortcode must be alphanumeric and between 3-20 characters')
];

// POST /shorturls - Create short URL
router.post('/', validateCreateShortUrl, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation error in create short URL', {
        errors: errors.array(),
        body: req.body
      });
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const result = await shortUrlController.createShortUrl(req.body);
    
    if (result.success) {
      logger.info('Short URL created successfully', {
        shortcode: result.shortcode,
        originalUrl: req.body.url
      });
      res.status(201).json(result.data);
    } else {
      logger.error('Failed to create short URL', {
        error: result.error,
        body: req.body
      });
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in create short URL', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shorturls/:shortcode - Get short URL statistics
router.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    if (!shortcode || shortcode.length < 3) {
      logger.error('Invalid shortcode provided', { shortcode });
      return res.status(400).json({ error: 'Invalid shortcode' });
    }

    const result = await shortUrlController.getShortUrlStats(shortcode, req);
    
    if (result.success) {
      logger.info('Short URL statistics retrieved', {
        shortcode,
        totalClicks: result.data.totalClicks
      });
      res.status(200).json(result.data);
    } else {
      logger.error('Failed to retrieve short URL statistics', {
        shortcode,
        error: result.error
      });
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in get short URL stats', {
      error: error.message,
      stack: error.stack,
      shortcode: req.params.shortcode
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 