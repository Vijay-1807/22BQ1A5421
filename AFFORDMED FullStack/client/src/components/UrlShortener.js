import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Analytics as AnalyticsIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const UrlShortener = () => {
  const [urls, setUrls] = useState([
    { id: 1, url: '', validity: 30, shortcode: '', shortLink: null, expiry: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Client-side validation
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateShortcode = (shortcode) => {
    if (!shortcode) return true; // Optional
    return /^[a-zA-Z0-9]{3,20}$/.test(shortcode);
  };

  const validateValidity = (validity) => {
    const num = parseInt(validity);
    return !isNaN(num) && num >= 1 && num <= 1440;
  };

  const handleUrlChange = (id, field, value) => {
    setUrls(prev => prev.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));

    // Clear validation errors when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const addUrl = () => {
    if (urls.length >= 5) {
      toast.error('Maximum 5 URLs allowed');
      return;
    }
    const newId = Math.max(...urls.map(u => u.id)) + 1;
    setUrls(prev => [...prev, { 
      id: newId, 
      url: '', 
      validity: 30, 
      shortcode: '', 
      shortLink: null, 
      expiry: null 
    }]);
  };

  const removeUrl = (id) => {
    if (urls.length === 1) {
      toast.error('At least one URL is required');
      return;
    }
    setUrls(prev => prev.filter(url => url.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const validateAll = () => {
    const newErrors = {};
    
    urls.forEach(url => {
      if (!url.url.trim()) {
        newErrors[url.id] = { ...newErrors[url.id], url: 'URL is required' };
      } else if (!validateUrl(url.url)) {
        newErrors[url.id] = { ...newErrors[url.id], url: 'Invalid URL format' };
      }
      
      if (url.shortcode && !validateShortcode(url.shortcode)) {
        newErrors[url.id] = { ...newErrors[url.id], shortcode: 'Shortcode must be 3-20 alphanumeric characters' };
      }
      
      if (!validateValidity(url.validity)) {
        newErrors[url.id] = { ...newErrors[url.id], validity: 'Validity must be 1-1440 minutes' };
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);

    try {
      const promises = urls.map(async (urlData) => {
        if (!urlData.url.trim()) return null;
        
        const payload = {
          url: urlData.url.trim(),
          validity: parseInt(urlData.validity),
          ...(urlData.shortcode && { shortcode: urlData.shortcode })
        };

        const response = await axios.post('/shorturls', payload);
        return {
          id: urlData.id,
          shortLink: response.data.shortLink,
          expiry: response.data.expiry
        };
      });

      const results = await Promise.all(promises);
      
      setUrls(prev => prev.map(url => {
        const result = results.find(r => r && r.id === url.id);
        return result ? { ...url, shortLink: result.shortLink, expiry: result.expiry } : url;
      }));

      toast.success('URLs shortened successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create short URLs';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const viewStats = (shortcode) => {
    navigate(`/stats/${shortcode}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Shorten Your URLs
      </Typography>
      <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
        Create up to 5 short, shareable links with detailed analytics
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <form onSubmit={handleSubmit}>
          {urls.map((urlData, index) => (
            <Box key={urlData.id} sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  URL {index + 1}
                </Typography>
                {urls.length > 1 && (
                  <IconButton 
                    onClick={() => removeUrl(urlData.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Long URL *"
                    value={urlData.url}
                    onChange={(e) => handleUrlChange(urlData.id, 'url', e.target.value)}
                    placeholder="https://example.com/very-long-url-that-needs-shortening"
                    error={!!errors[urlData.id]?.url}
                    helperText={errors[urlData.id]?.url}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={urlData.validity}
                    onChange={(e) => handleUrlChange(urlData.id, 'validity', e.target.value)}
                    inputProps={{ min: 1, max: 1440 }}
                    error={!!errors[urlData.id]?.validity}
                    helperText={errors[urlData.id]?.validity || "Default: 30 minutes"}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    value={urlData.shortcode}
                    onChange={(e) => handleUrlChange(urlData.id, 'shortcode', e.target.value)}
                    placeholder="my-custom-link"
                    error={!!errors[urlData.id]?.shortcode}
                    helperText={errors[urlData.id]?.shortcode || "3-20 alphanumeric characters"}
                  />
                </Grid>
              </Grid>

              {urlData.shortLink && (
                <Card sx={{ mt: 2, bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Short URL Created
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {urlData.shortLink}
                      </Typography>
                      <IconButton 
                        onClick={() => copyToClipboard(urlData.shortLink)}
                        color="primary"
                      >
                        <CopyIcon />
                      </IconButton>
                    </Box>
                    <Box display="flex" alignItems="center" mt={1}>
                      <ScheduleIcon sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2">
                        Expires: {new Date(urlData.expiry).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={<AnalyticsIcon />}
                      onClick={() => viewStats(urlData.shortLink.split('/').pop())}
                      variant="outlined"
                      size="small"
                    >
                      View Analytics
                    </Button>
                  </CardActions>
                </Card>
              )}

              {index < urls.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addUrl}
              disabled={urls.length >= 5}
            >
              Add Another URL
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
              disabled={loading}
              size="large"
            >
              {loading ? 'Creating Short URLs...' : 'Create Short URLs'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> You can create up to 5 URLs at once. Each URL will be validated and shortened individually.
        </Typography>
      </Alert>
    </Container>
  );
};

export default UrlShortener; 