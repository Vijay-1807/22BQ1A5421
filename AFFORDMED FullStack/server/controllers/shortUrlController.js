const shortUrlService = require('../services/shortUrlService');
const { logger } = require('../middleware/logging');

class ShortUrlController {
  async createShortUrl(data) {
    try {
      const { url, validity = 30, shortcode } = data;
      
      logger.info('Creating short URL', {
        originalUrl: url,
        validity,
        customShortcode: shortcode || 'auto-generated'
      });

      const result = await shortUrlService.createShortUrl(url, validity, shortcode);
      
      if (result.success) {
        return {
          success: true,
          shortcode: result.shortcode,
          data: {
            shortLink: `${process.env.BASE_URL || 'http://localhost:5000'}/${result.shortcode}`,
            expiry: result.expiresAt.toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      logger.error('Error in createShortUrl controller', {
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: 'Failed to create short URL'
      };
    }
  }

  async getShortUrlStats(shortcode, req) {
    try {
      logger.info('Retrieving short URL statistics', { shortcode });

      const result = await shortUrlService.getShortUrlStats(shortcode);
      
      if (result.success) {
        return {
          success: true,
          data: {
            shortcode: result.shortcode,
            originalUrl: result.originalUrl,
            totalClicks: result.totalClicks,
            createdAt: result.createdAt,
            expiresAt: result.expiresAt,
            isExpired: result.isExpired,
            clickData: result.clickData
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      logger.error('Error in getShortUrlStats controller', {
        error: error.message,
        stack: error.stack,
        shortcode
      });
      return {
        success: false,
        error: 'Failed to retrieve short URL statistics'
      };
    }
  }
}

module.exports = new ShortUrlController(); 