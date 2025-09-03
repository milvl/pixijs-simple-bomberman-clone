import React from 'react';
import { Box, Typography, Link, Button } from '@mui/material';
import { INDEX_VIEW_LANDING_PAGE } from './index.jsx';

export function SpecialThanks({ setCurrentView }) {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Box sx={{ width: '50vw', textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom>
          Special thanks for assets to:
        </Typography>

        <Typography>
          <Link href="https://cat-tabern.itch.io/" target="_blank" rel="noopener">
            - cat-tabern for ghost sprites
          </Link>
        </Typography>

        <Typography>
          <Link href="https://kevins-moms-house.itch.io/" target="_blank" rel="noopener">
            - Kevin's Mom's House for player sprites
          </Link>
        </Typography>

        <Typography>
          <Link
            href="https://www.freepik.com/free-vector/video-game-explosion-animation-pixel-art-explosion-animation-frames_13437690.htm"
            target="_blank"
            rel="noopener"
          >
            - freepik for explosion sprite
          </Link>
        </Typography>

        <Typography>
          <Link href="https://pixabay.com/" target="_blank" rel="noopener">
            - pixabay for sound effects
          </Link>
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setCurrentView(INDEX_VIEW_LANDING_PAGE)}
        sx={{ margin: '5vh' }}
      >
        Back to Landing Page
      </Button>
    </Box>
  );
}

export default SpecialThanks;
