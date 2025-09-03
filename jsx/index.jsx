import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPage } from './landing_page.jsx';
import { HowToPlay } from './how_to_play.jsx';
import { SpecialThanks } from './special_thanks.jsx';
import { useState } from 'react';
// import PressStart2PTTF from '../fonts/PressStart2P-vaV7.ttf';
const PressStart2PTTF = new URL('../fonts/PressStart2P-vaV7.ttf', import.meta.url).href;
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const INDEX_VIEW_LANDING_PAGE = 0;
export const INDEX_VIEW_HOW_TO_PLAY = 1;
export const INDEX_VIEW_SPECIAL_THANKS = 2;

const primaryTheme = createTheme({
  palette: {
    primary: {
      main: '#FFFFFF',
    },
    background: {
      default: '#000000',
    },
  },
  typography: {
    fontFamily: '"Press Start 2P", Arial', 
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Press Start 2P';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url(${PressStart2PTTF}) format('truetype');
          unicodeRange: U+0000-00FF; /* adjust if needed */
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '5vh',
        },
      },
    },
  }
});

const secondaryTheme = createTheme({
  palette: {
    primary: {
      main: '#FFFFFF',
    },
    background: {
      default: '#000000',
    },
    text: {
      primary: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Press Start 2P", Arial', 
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Press Start 2P';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url(${PressStart2PTTF}) format('truetype');
          unicodeRange: U+0000-00FF; /* adjust if needed */
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '5vh',
        },
      },
    },
  }
});

function App() {
  const [currentView, setCurrentView] = useState(INDEX_VIEW_LANDING_PAGE);

  let resultElem
  if (currentView === INDEX_VIEW_LANDING_PAGE) {
    resultElem = <LandingPage setCurrentView={setCurrentView} />;
  }
  else if (currentView === INDEX_VIEW_HOW_TO_PLAY) {
    resultElem = <HowToPlay setCurrentView={setCurrentView} />;
  } 
  else if (currentView === INDEX_VIEW_SPECIAL_THANKS) {
    resultElem = <SpecialThanks setCurrentView={setCurrentView} />;
  } 
  else {
    resultElem = <div>Unknown View</div>;
  }

  return (
    <ThemeProvider theme={currentView === INDEX_VIEW_LANDING_PAGE ? primaryTheme : secondaryTheme}>
      <CssBaseline />
      {resultElem}
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
