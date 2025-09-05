import React from 'react';
import { Box, Typography, Link, Button } from '@mui/material';

export function PortraitMode() {
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
        <Typography 
            variant='body1'
            gutterBottom
            sx={{ textAlign: 'justify', margin: '5vw' }} >
          Please switch to landscape mode or use a device with landscape orientation. The game 
          is playable only on devices that support landscape mode and keyboard input.
        </Typography>
    </Box>
  );
}

export default PortraitMode;
