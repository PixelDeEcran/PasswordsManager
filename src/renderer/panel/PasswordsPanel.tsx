import React, { useEffect, useState } from 'react';

import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  CircularProgress,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardHeader,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  OutlinedInput,
  Input,
  InputLabel,
  FormControl,
  Box,
  Typography,
} from '@mui/material';
import {
  AddOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreVertOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

import { PasswordData } from 'main/core/Types';
import { SnackbarProvider, useSnackbar } from 'notistack';

function EditPasswordDialog({ edit, open, handleClose, currentPassword }) {
  const theme = useTheme();

  const [serviceName, setServiceName] = React.useState(
    currentPassword !== null ? currentPassword.serviceName : ''
  );
  const [password, setPassword] = React.useState(
    currentPassword !== null ? currentPassword.password : ''
  );
  const [showPassword, setShowPassword] = React.useState(false);

  const ipcRenderer = window.electron.ipcRenderer.get();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          backgroundColor: `${theme.palette.background.dark}`,
        },
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (
            currentPassword !== null &&
            currentPassword.serviceName !== serviceName
          ) {
            ipcRenderer.send('removePassword', currentPassword.serviceName);
          }

          ipcRenderer.send('updatePassword', {
            serviceName,
            password,
            updateDate: Date.now(),
          });

          handleClose();
        }}
      >
        <DialogTitle>{edit ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
            <InputLabel htmlFor="serviceName">Service Name</InputLabel>
            <Input
              autoFocus
              margin="dense"
              id="serviceName"
              type="text"
              fullWidth
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              margin="dense"
              id="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {edit ? 'Edit' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function CopyPasswordButton(props: { password: { password: string } }) {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <IconButton
      aria-label="copy password"
      sx={{
        marginLeft: 'auto',
      }}
      onClick={() => {
        const el = document.createElement('textarea');
        el.value = props.password.password;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        enqueueSnackbar('Password copied!', {
          variant: 'success',
          autoHideDuration: 1500,
        });
      }}
    >
      <ContentCopyOutlined />
    </IconButton>
  );
}

export default function PasswordsPanel() {
  const theme = useTheme();

  const [screenSize, setScreenSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [passwords, setPasswords] = useState<PasswordData[] | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorPassword, setAnchorPassword] =
    React.useState<null | PasswordData>(null);
  const menuOpen = Boolean(anchorEl);
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    password: PasswordData
  ) => {
    setAnchorEl(event.currentTarget);
    setAnchorPassword(password);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setAnchorPassword(null);
  };

  const [editPassword, setEditPassword] = React.useState({
    open: false,
    currentPassword: null,
    edit: false,
  });

  const ipcRenderer = window.electron.ipcRenderer.get();

  useEffect(() => {
    ipcRenderer
      .invoke('acquirePasswords')
      .then((respond: PasswordData[]) => {
        setPasswords(respond);
        return respond;
      })
      .catch((error: any) => {});

    window.electron.ipcRenderer.on(
      'passwordListChange',
      (respond: PasswordData[]) => {
        setPasswords(respond);
      }
    );
    window.addEventListener('resize', () => {
      setScreenSize([window.innerWidth, window.innerHeight]);
    });
  }, []);

  return (
    <SnackbarProvider maxSnack={3}>
      {(passwords === null && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            height: `${screenSize[1] - 80}px`,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 1 }}>&nbsp;&nbsp;&nbsp;Loading...</Typography>
        </Box>
      )) || (
        <>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            sx={{
              p: 5,
            }}
          >
            {passwords?.map((password) => (
              <Grid item xs={2} sm={4} md={4} key={password.serviceName}>
                <Card>
                  <CardHeader
                    title={password.serviceName}
                    subheader={new Date(password.updateDate).toLocaleDateString(
                      'fr-FR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  />
                  <CardActions disableSpacing>
                    <CopyPasswordButton password={password} />
                    <IconButton
                      aria-label="edit"
                      onClick={() => {
                        setEditPassword({
                          open: true,
                          currentPassword: password,
                          edit: true,
                        });
                      }}
                    >
                      <EditOutlined />
                    </IconButton>
                    <IconButton
                      aria-label="more actions"
                      onClick={(event) => handleOpenMenu(event, password)}
                    >
                      <MoreVertOutlined />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="text"
            size="medium"
            startIcon={<AddOutlined />}
            sx={{ margin: '0 auto', display: 'flex' }}
            onClick={() => {
              setEditPassword({
                open: true,
                currentPassword: null,
                edit: false,
              });
            }}
          >
            Add Service
          </Button>
        </>
      )}
      <Menu
        id="password-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'bot-menu-button',
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();

            if (anchorPassword !== null) {
              ipcRenderer.send('removePassword', anchorPassword.serviceName);
            }
          }}
        >
          <ListItemIcon>
            <DeleteOutlined
              fontSize="small"
              sx={{
                color: 'error.light',
              }}
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              color: 'error.light',
            }}
          >
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
      {editPassword.open && (
        <EditPasswordDialog
          open={editPassword.open}
          handleClose={() =>
            setEditPassword({
              open: false,
              currentPassword: null,
              edit: false,
            })
          }
          edit={editPassword.edit}
          currentPassword={editPassword.currentPassword}
        />
      )}
    </SnackbarProvider>
  );
}
