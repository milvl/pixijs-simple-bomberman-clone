import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { INDEX_VIEW_LANDING_PAGE } from './index.jsx';

export function HowToPlay({ setCurrentView }) {
  return (
    <Box 
        sx={{display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
        }}
    > 
      <Box 
        sx={{
          width: '50vw',
          textAlign: 'left',
        }}
        >
        <Typography variant="h6" gutterBottom>
            To control the game use:
        </Typography>
        <Typography>- Arrow keys</Typography>
        <Typography>- Esc</Typography>
        <Typography>- Enter</Typography>
        <Typography>- 'P' to pause</Typography>
        <Typography>- Space to place a bomb</Typography>
        <Box sx={{ m: '2vh' }} />
        <Typography>Start controlling by clicking the game screen.</Typography>
        <Typography>Fullscreen mode is supported.</Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setCurrentView(INDEX_VIEW_LANDING_PAGE)}
        sx={{
            margin: '5vh',
        }}
      >
      Back to Landing Page
      </Button>
    </Box>
  );
};

export default HowToPlay;