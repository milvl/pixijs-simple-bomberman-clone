import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPage } from './landing_page.jsx';
import { HowToPlay } from './how_to_play.jsx';
import { SpecialThanks } from './special_thanks.jsx';
import { PortraitMode } from './portrait_mode.jsx';
import { useState, useEffect } from 'react';
// import PressStart2PTTF from '../fonts/PressStart2P-vaV7.ttf';
const PressStart2PTTF = new URL('../fonts/PressStart2P-vaV7.ttf', import.meta.url).href;
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const INDEX_VIEW_LANDING_PAGE = 0;
export const INDEX_VIEW_HOW_TO_PLAY = 1;
export const INDEX_VIEW_SPECIAL_THANKS = 2;
export const INDEX_VIEW_PORTRAIT_MODE = 3;

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

function useCheckPortraitMode() {
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const onResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isPortrait;
}

function App() {
  const [currentView, setCurrentView] = useState(INDEX_VIEW_LANDING_PAGE);
  const [lastView, setLastView] = useState(INDEX_VIEW_LANDING_PAGE);
  const isPortraitMode = useCheckPortraitMode();

  useEffect(() => {
    if (isPortraitMode) {
      setLastView(currentView);
      setCurrentView(INDEX_VIEW_PORTRAIT_MODE);
    } 
    else if (currentView === INDEX_VIEW_PORTRAIT_MODE) {
        setCurrentView(lastView);
    }
  }, [isPortraitMode]);

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
  else if (currentView === INDEX_VIEW_PORTRAIT_MODE) {
    resultElem = <PortraitMode />;
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
