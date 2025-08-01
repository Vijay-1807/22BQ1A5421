const { v4: uuidv4 } = require('uuid');
const { logger } = require('../middleware/logging');

// In-memory storage (in production, this would be a database)
const urlStore = new Map();
const clickStore = new Map();

class ShortUrlService {
  constructor() {
    // Clean up expired URLs every hour
    setInterval(() => this.cleanupExpiredUrls(), 60 * 60 * 1000);
  }

  generateShortcode() {
    // Generate a 6-character alphanumeric shortcode
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createShortUrl(originalUrl, validity = 30, customShortcode = null) {
    try {
      // Validate URL
      if (!this.isValidUrl(originalUrl)) {
        return { success: false, error: 'Invalid URL format' };
      }

      let shortcode = customShortcode;
      
      // Generate shortcode if not provided
      if (!shortcode) {
        shortcode = this.generateShortcode();
        // Ensure uniqueness
        while (urlStore.has(shortcode)) {
          shortcode = this.generateShortcode();
        }
      } else {
        // Check if custom shortcode is already in use
        if (urlStore.has(shortcode)) {
          return { success: false, error: 'Shortcode already in use' };
        }
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + validity * 60 * 1000);

      const urlData = {
        shortcode,
        originalUrl,
        validity,
        createdAt: now,
        expiresAt,
        isExpired: false
      };

      // Store the URL data
      urlStore.set(shortcode, urlData);
      
      // Initialize click tracking
      clickStore.set(shortcode, []);

      logger.info('Short URL created', {
        shortcode,
        originalUrl,
        validity,
        expiresAt
      });

      return {
        success: true,
        shortcode,
        createdAt: now,
        expiresAt
      };
    } catch (error) {
      logger.error('Error creating short URL', {
        error: error.message,
        originalUrl,
        validity,
        customShortcode
      });
      return { success: false, error: 'Failed to create short URL' };
    }
  }

  async redirectToOriginal(shortcode, req) {
    try {
      const urlData = urlStore.get(shortcode);
      
      if (!urlData) {
        logger.warn('Short URL not found', { shortcode });
        return { success: false, error: 'Short URL not found' };
      }

      // Check if URL is expired
      if (new Date() > urlData.expiresAt) {
        urlData.isExpired = true;
        logger.warn('Short URL expired', { shortcode, expiresAt: urlData.expiresAt });
        return { success: false, error: 'Short URL has expired' };
      }

      // Record click
      const clickData = {
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer') || 'Direct',
        location: this.getCoarseLocation(req.ip) // Simplified location detection
      };

      const clicks = clickStore.get(shortcode) || [];
      clicks.push(clickData);
      clickStore.set(shortcode, clicks);

      logger.info('Short URL accessed', {
        shortcode,
        originalUrl: urlData.originalUrl,
        clickData
      });

      return {
        success: true,
        originalUrl: urlData.originalUrl
      };
    } catch (error) {
      logger.error('Error redirecting to original URL', {
        error: error.message,
        shortcode
      });
      return { success: false, error: 'Failed to redirect' };
    }
  }

  async getShortUrlStats(shortcode) {
    try {
      const urlData = urlStore.get(shortcode);
      
      if (!urlData) {
        return { success: false, error: 'Short URL not found' };
      }

      const clicks = clickStore.get(shortcode) || [];
      const totalClicks = clicks.length;

      // Check if URL is expired
      const isExpired = new Date() > urlData.expiresAt;

      logger.info('Retrieved short URL statistics', {
        shortcode,
        totalClicks,
        isExpired
      });

      return {
        success: true,
        shortcode: urlData.shortcode,
        originalUrl: urlData.originalUrl,
        totalClicks,
        createdAt: urlData.createdAt,
        expiresAt: urlData.expiresAt,
        isExpired,
        clickData: clicks
      };
    } catch (error) {
      logger.error('Error getting short URL statistics', {
        error: error.message,
        shortcode
      });
      return { success: false, error: 'Failed to retrieve statistics' };
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  getCoarseLocation(ip) {
    // Simplified location detection
    // In a real application, you would use a geolocation service
    if (ip === '::1' || ip === '127.0.0.1') {
      return 'Local';
    }
    
    // Simple IP-based location (for demo purposes)
    const ipParts = ip.split('.');
    if (ipParts.length === 4) {
      return `${ipParts[0]}.${ipParts[1]}.*.*`;
    }
    
    return 'Unknown';
  }

  cleanupExpiredUrls() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [shortcode, urlData] of urlStore.entries()) {
      if (now > urlData.expiresAt) {
        urlStore.delete(shortcode);
        clickStore.delete(shortcode);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up expired URLs', { cleanedCount });
    }
  }
}

module.exports = new ShortUrlService(); 