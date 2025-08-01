import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box display="flex" alignItems="center">
            <LinkIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              URL Shortener
            </Typography>
          </Box>
        </Link>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button 
          color="inherit" 
          component={Link} 
          to="/"
          sx={{ mr: 2 }}
        >
          Home
        </Button>
        
        <Button 
          color="inherit" 
          href="http://localhost:5000/health" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          API Health
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 