import React from 'react';
import { Button, Container, Stack } from '@mui/material';
import { INDEX_VIEW_HOW_TO_PLAY, INDEX_VIEW_SPECIAL_THANKS } from './index.jsx';

const startGameFn = () => {
  // change url to game.html
  window.location.href = 'game.html';
}

export function LandingPage({setCurrentView}) {
  return (
    <Container 
      maxWidth='md'
      sx={{
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
      }}
    >
      <Stack 
        spacing='14vh'
        alignItems='center'
      >
        <Option 
          label='Start Game'
          onClick={() => startGameFn()}
        />
        <Option 
          label='How To Play'
          onClick={() => setCurrentView(INDEX_VIEW_HOW_TO_PLAY)}
        />
        <Option 
          label='Special Thanks'
          onClick={() => setCurrentView(INDEX_VIEW_SPECIAL_THANKS)}
        />
      </Stack>
    </Container>
  );
}

function Option( {label, onClick} ) {
  return (
    <Button 
      variant='contained' 
      color='primary' 
      onClick={onClick}
      sx={{ width: '20vw', height: '14vh', fontSize: '2.5vh'}}
    >
      {label}
    </Button>
  );
}

export default LandingPage;