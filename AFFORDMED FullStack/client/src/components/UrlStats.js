import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const UrlStats = () => {
  const { shortcode } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [shortcode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/shorturls/${shortcode}`);
      setStats(response.data);
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch statistics';
      setError(errorMessage);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center" py={6}>
          <Typography variant="h4" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {error}
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!stats) {
    return null;
  }

  const shortUrl = `http://localhost:5000/${shortcode}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom display="flex" alignItems="center">
          <AnalyticsIcon sx={{ mr: 2, fontSize: '2rem' }} />
          URL Analytics
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Statistics for shortcode: <Chip label={shortcode} variant="outlined" />
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Clicks</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {stats.totalClicks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScheduleIcon color={stats.isExpired ? "error" : "success"} sx={{ mr: 1 }} />
                <Typography variant="h6">Status</Typography>
              </Box>
              <Chip 
                label={stats.isExpired ? 'Expired' : 'Active'} 
                color={stats.isExpired ? "error" : "success"}
                variant="filled"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LinkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Created</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {new Date(stats.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* URL Information */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom display="flex" alignItems="center">
          <LinkIcon sx={{ mr: 1 }} />
          URL Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="grey.50" borderRadius={1}>
              <Box flex={1}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Short URL
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {shortUrl}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => copyToClipboard(shortUrl)}
                color="primary"
              >
                <CopyIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="grey.50" borderRadius={1}>
              <Box flex={1}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Original URL
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {stats.originalUrl}
                </Typography>
              </Box>
              <IconButton 
                component="a"
                href={stats.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                <OpenInNewIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(stats.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Expires
                </Typography>
                <Typography variant="body1">
                  {new Date(stats.expiresAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Click Data */}
      {stats.clickData && stats.clickData.length > 0 ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom display="flex" alignItems="center">
            <LocationIcon sx={{ mr: 1 }} />
            Click Details
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Referrer</TableCell>
                  <TableCell>User Agent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.clickData.map((click, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {new Date(click.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {click.ip}
                    </TableCell>
                    <TableCell>
                      <Chip label={click.location} size="small" />
                    </TableCell>
                    <TableCell>
                      {click.referrer}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {click.userAgent}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <LocationIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Clicks Yet
          </Typography>
          <Typography variant="body1" color="textSecondary">
            This URL hasn't been clicked yet. Share it to see analytics!
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default UrlStats; 