import React from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Redirect,
  BrowserRouter,
} from 'react-router-dom';

import { createTheme, ThemeProvider } from '@mui/material';
import TypeBackground from './createPalette';
import './App.global.css';
import LoginApp from './login/LoginApp';
import PanelApp from './panel/PanelApp';

const theme = createTheme({
  spacing: 8,
  palette: {
    mode: 'dark',
    primary: {
      light: '#ce4b84',
      main: '#d6176a',
      dark: '#aa0f52',
    },
    secondary: {
      light: '#ffa371',
      main: '#ff8747',
      dark: '#ff6f22',
    },
    background: {
      default: '#1f1f25',
      dark: '#1a1a1f',
      paper: '#2f2f38',
    },
  },
});

export default function App() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Router>
            <Switch>
              <Route exact path="/" component={LoginApp} />
              <Route path="/panel" component={PanelApp} />
              <Route render={() => <Redirect to="/" />} />
            </Switch>
          </Router>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}
