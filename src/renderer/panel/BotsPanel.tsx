import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Avatar,
  ListItemAvatar,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  AdbOutlined,
  AddOutlined,
  CheckCircleOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExitToAppOutlined,
  FilterNoneOutlined,
  MenuOutlined,
  MoreVertOutlined,
  RemoveOutlined,
  SyncOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';

import { BotData, SubPanel } from 'main/core/Types';

export default function BotsPanel() {
  const theme = useTheme();

  const [botList, setBotList] = useState<BotData[] | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorBotData, setAnchorBotData] =
    React.useState<null | BotData>(null);
  const menuOpen = Boolean(anchorEl);
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    botData: BotData
  ) => {
    setAnchorEl(event.currentTarget);
    setAnchorBotData(botData);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setAnchorBotData(null);
  };

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [tokenAddDialog, setTokenAddDialog] = React.useState('');
  const [ledgerChannelIdAddDialog, setLedgerChannelIdAddDialog] =
    React.useState('');

  const ipcRenderer = window.electron.ipcRenderer.get();

  useEffect(() => {
    ipcRenderer
      .invoke('acquireBotData')
      .then((respond: { botList: BotData[]; selectedBot: BotData | null }) => {
        setBotList(respond.botList);
        setSelectedBot(respond.selectedBot);
        return respond;
      })
      .catch((error: any) => {});

    window.electron.ipcRenderer.on(
      'newSelectedBot',
      (bot: BotData | null, lastBot: BotData) => {
        setSelectedBot(bot);
      }
    );
    window.electron.ipcRenderer.on('botListChange', (botListRespond: any) => {
      setBotList(botListRespond);
    });
  }, []);

  return (
    <Box sx={{}}>
      {(botList === null && <CircularProgress />) || (
        <>
          <List
            sx={{
              p: 5,
            }}
          >
            {botList !== null &&
              botList.map((botData) => (
                <ListItem
                  key={botData.token}
                  sx={{
                    transition: theme.transitions.create('border-color', {
                      easing: theme.transitions.easing.easeOut,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                    borderLeft: `solid 0 transparent`,
                    ...(selectedBot !== null &&
                      selectedBot.token === botData.token && {
                        transition: theme.transitions.create('border-color', {
                          easing: theme.transitions.easing.easeOut,
                          duration: theme.transitions.duration.enteringScreen,
                        }),
                        borderLeft: `solid 4px ${theme.palette.primary.main}`,
                      }),
                    bgcolor: 'background.paper',
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      id="bot-menu-button"
                      aria-label="more"
                      aria-controls="bot-menu"
                      aria-haspopup="true"
                      aria-expanded={menuOpen ? 'true' : undefined}
                      onClick={(event) => handleOpenMenu(event, botData)}
                      sx={{
                        mr: 1,
                      }}
                    >
                      <MoreVertOutlined />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <img
                        src={botData.lastAvatarURL}
                        alt={`Avatar of ${botData.lastName}`}
                        width={40}
                        height={40}
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={botData.lastName !== '' ? botData.lastName : '...'}
                    secondary={`#${
                      botData.lastLedgerChannelName !== ''
                        ? botData.lastLedgerChannelName
                        : '...'
                    }`}
                  />
                </ListItem>
              ))}
          </List>
          <Button
            variant="text"
            size="medium"
            startIcon={<AddOutlined />}
            sx={{ margin: '0 auto', display: 'flex' }}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Bot
          </Button>
        </>
      )}
      <Menu
        id="bot-menu"
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

            if (anchorBotData !== null) {
              ipcRenderer.send(
                'selectBot',
                selectedBot !== null &&
                  selectedBot.token === anchorBotData.token
                  ? null
                  : anchorBotData.token
              );
            }
          }}
        >
          <ListItemIcon>
            <CheckCircleOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {anchorBotData !== null &&
            selectedBot !== null &&
            selectedBot.token === anchorBotData.token
              ? 'Unselect'
              : 'Select'}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();

            if (anchorBotData !== null) {
              ipcRenderer.send('syncBot', anchorBotData.token);
            }
          }}
        >
          <ListItemIcon>
            <SyncOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sync</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();

            if (anchorBotData !== null) {
              ipcRenderer.send('removeBot', anchorBotData.token);
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
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: `${theme.palette.background.dark}`,
          },
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();

            setAddDialogOpen(false);

            ipcRenderer.send(
              'addBot',
              tokenAddDialog,
              ledgerChannelIdAddDialog
            );
          }}
        >
          <DialogTitle>Add Bot</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="token"
              label="Bot Token"
              type="text"
              fullWidth
              variant="standard"
              value={tokenAddDialog}
              onChange={(event) => setTokenAddDialog(event.target.value)}
            />
            <TextField
              margin="dense"
              id="ledgerChannelId"
              label="Ledger Channel Id"
              type="text"
              fullWidth
              variant="standard"
              value={ledgerChannelIdAddDialog}
              onChange={(event) =>
                setLedgerChannelIdAddDialog(event.target.value)
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
