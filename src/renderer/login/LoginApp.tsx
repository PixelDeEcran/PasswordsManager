import React from 'react';

import { Box, Button, Link, TextField, Theme, Typography } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

export default function LoginApp() {
  const history = useHistory();
  const [password, setPassword] = React.useState('');

  const ipcRenderer = window.electron.ipcRenderer.get();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    ipcRenderer.send('auth', password);
    history.push('/panel');
  };

  return (
    <Box
      className="draggable"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: `calc(100% - 6px)`,
        width: '100%',
        transform: 'translate(-50%, calc(-50% - 3px))',

        background: (theme) => theme.palette.background.default,
        boxSizing: 'border-box',
        boxShadow: (theme) => `0 6px 0 0 ${theme.palette.background.dark}`,
        borderRadius: 6,

        textAlign: 'center',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          minWidth: '75%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -60%)',
          margin: 0,
        }}
      >
        <LockOutlined
          style={{
            fontSize: 60,
          }}
        />
        <Typography variant="h4">Login</Typography>

        <form
          className="login-form"
          noValidate
          style={{
            marginTop: 20,
          }}
          onSubmit={handleSubmit}
        >
          <TextField
            type="password"
            variant="outlined"
            required
            fullWidth
            margin="normal"
            id="password"
            label="Secret Key"
            name="password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" color="primary">
            Login
          </Button>
        </form>
      </Box>

      <Box
        className="not-draggable"
        sx={{
          position: 'absolute',
          top: 'calc(100% - 16px)',
          left: '50%',
          transform: 'translate(-50%, -100%)',
        }}
      >
        <Typography variant="body2" color="textSecondary" align="center">
          {'Made with ❤️ by '}
          <Link href="https://github.com/PixelDeEcran" target="_blank">
            PixelDeEcran
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
