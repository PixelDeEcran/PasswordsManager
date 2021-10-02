import React from 'react';
import clsx from 'clsx';

import {
  Theme,
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AdbOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CloseOutlined,
  ExitToAppOutlined,
  FilterNoneOutlined,
  MenuOutlined,
  RemoveOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';

import { SubPanel } from 'main/core/Types';
import { useHistory } from 'react-router-dom';
import BotsPanel from './BotsPanel';
import PasswordsPanel from './PasswordsPanel';

const drawerWidth = 240;
const subPanels: { [name: string]: SubPanel } = {
  passwords: {
    displayName: 'Passwords',
    panel: PasswordsPanel,
    icon: VpnKeyOutlined,
  },
  bots: {
    displayName: 'Bots',
    panel: BotsPanel,
    icon: AdbOutlined,
  },
};
const subPanelsNames = Object.keys(subPanels);

export default function PanelApp() {
  const theme = useTheme();
  const history = useHistory();

  const [panel, setPanel] = React.useState('passwords');
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const currentPanel = subPanels[panel];
  const CurrentSubPanel = currentPanel.panel;

  const ipcRenderer = window.electron.ipcRenderer.get();

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const subPanelsList = subPanelsNames.map((name) => {
    const SubPanelIcon = subPanels[name].icon;

    return (
      <ListItem
        button
        key={name}
        onClick={() => setPanel(name)}
        sx={{
          ...(panel === name && {
            borderLeft: `solid 4px ${theme.palette.primary.main}`,
          }),
        }}
      >
        <ListItemIcon>
          <SubPanelIcon />
        </ListItemIcon>
        <ListItemText primary={subPanels[name].displayName} />
      </ListItem>
    );
  });

  return (
    <Box
      className="not-draggable"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: `calc(100% - 6px)`,
        width: '100%',
        transform: 'translate(-50%, calc(-50% - 3px))',

        background: theme.palette.background.default,
        boxSizing: 'border-box',
        boxShadow: `0 6px 0 0 ${theme.palette.background.dark}`,
        borderRadius: 1,
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: theme.palette.primary.main,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar className="draggable">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(drawerOpen && {
                display: 'none',
              }),
            }}
          >
            <MenuOutlined />
          </IconButton>
          <Typography variant="h6" noWrap>
            Password Manager
          </Typography>

          <ButtonGroup
            aria-label="text primary button group"
            sx={{
              ml: 'auto',
              mr: -1,
            }}
          >
            <IconButton
              color="inherit"
              onClick={() => {
                ipcRenderer.send('minimize');
              }}
            >
              <RemoveOutlined />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => {
                ipcRenderer.send('maximize');
              }}
            >
              <FilterNoneOutlined />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => {
                ipcRenderer.send('close');
              }}
            >
              <CloseOutlined />
            </IconButton>
          </ButtonGroup>
        </Toolbar>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: 1,
              // necessary for content to be below app bar
              ...theme.mixins.toolbar,
              justifyContent: 'flex-end',
            }}
          >
            <Typography
              noWrap
              sx={{
                mr: 1,
              }}
            >
              Menu
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? (
                <ChevronLeftOutlined />
              ) : (
                <ChevronRightOutlined />
              )}
            </IconButton>
          </Box>

          <Divider />

          <List>{subPanelsList}</List>

          <Divider />

          <List>
            <ListItem
              button
              onClick={() => {
                ipcRenderer.send('auth', null);
                history.push('/');
              }}
            >
              <ListItemIcon>
                <ExitToAppOutlined />
              </ListItemIcon>
              <ListItemText>Log out</ListItemText>
            </ListItem>
          </List>
        </Drawer>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          transition: theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          pl: 0,
          ...(drawerOpen && {
            transition: theme.transitions.create('padding', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            pl: drawerWidth / 8,
          }),
        }}
      >
        <CurrentSubPanel />
      </Box>
    </Box>
  );
}
