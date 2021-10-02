import { BrowserWindow, ipcMain } from 'electron';
import ElectronStore from 'electron-store';
import crypto from 'crypto';
import Bot from './Bot';
import { BotData } from './Types';

export default class BotsManager {
  store: ElectronStore;

  window: BrowserWindow;

  selectedBot: Bot | null;

  passwordsManager: any | null;

  constructor(store: ElectronStore, window: BrowserWindow) {
    this.store = store;
    this.window = window;
    this.selectedBot = null;

    ipcMain.handle('acquireBotData', (event) => {
      return {
        botList: this.getBotsData(),
        selectedBot:
          this.selectedBot !== null ? this.selectedBot.botData : null,
      };
    });

    ipcMain.on('selectBot', (event, token: string | null) => {
      this.selectBot(token);
      this.passwordsManager.sync();
    });

    ipcMain.on('addBot', (event, token: string, ledgerChannelId: string) => {
      this.addBot(token, ledgerChannelId);
    });

    ipcMain.on('removeBot', (event, token: string) => {
      this.removeBot(token);
    });

    ipcMain.on('syncBot', (event, token: string) => {
      this.syncBot(token);
      const serviceName = crypto.randomBytes(4).toString('hex');
      this.passwordsManager.setPasswordData(
        serviceName,
        {
          serviceName,
          password: crypto.randomBytes(8).toString('hex'),
          updateDate: Date.now(),
        },
        true
      );
    });
  }

  setPasswordsManager(passwordsManager: any) {
    this.passwordsManager = passwordsManager;

    if (this.store.get('selectedBot') !== undefined) {
      this.selectBot(this.store.get('selectedBot') as string | null);
      this.passwordsManager.sync();
    }
  }

  addBot(token: string, ledgerChannelId: string) {
    this.setBotData(token, {
      token,
      ledgerChannelId,
      lastName: '',
      lastAvatarURL: '',
      lastLedgerChannelName: '',
    });

    this.syncBot(token);
  }

  removeBot(token: string): void {
    this.setBotData(token, null);
  }

  syncBot(token: string): void {
    const botData = this.getBotData(token);
    if (botData !== undefined) {
      const bot = new Bot(botData);

      bot
        .updateStatut()
        .then((result) => {
          this.setBotData(token, bot.botData);
          return result;
        })
        .catch((error) => {});
    }
  }

  selectBot(token: string | null): void {
    const lastBot = this.selectedBot;
    let botData: BotData | null | undefined = null;

    if (token !== null) {
      botData = this.getBotData(token);
    }

    this.selectedBot =
      botData !== null && botData !== undefined ? new Bot(botData) : null;
    this.store.set('selectedBot', token);
    this.window.webContents.send(
      'newSelectedBot',
      this.selectedBot !== null ? this.selectedBot.botData : null,
      lastBot !== null ? lastBot.botData : null
    );
  }

  updateStatut(token: string): void {
    const botData = this.getBotData(token);

    if (botData !== undefined) {
      const bot = new Bot(botData);

      bot
        .updateStatut()
        .then((result) => {
          this.setBotData(token, botData);
          return result;
        })
        .catch((error) => {});
    }
  }

  setBotData(token: string, botData: BotData | null): void {
    const botsData = this.getBotsData();
    const botDataFound = botsData.find(
      (botData1: BotData) => botData1.token === token
    );
    if (botDataFound !== undefined) {
      botsData.splice(botsData.indexOf(botDataFound), 1);
    }

    if (botData !== null) {
      botsData.push(botData);
    } else if (
      this.selectedBot !== null &&
      this.selectedBot.botData.token === token
    ) {
      this.selectBot(null);
    }
    this.setBotsData(botsData);
  }

  getBotData(token: string): BotData | undefined {
    return this.getBotsData().find(
      (botData: BotData) => botData.token === token
    );
  }

  setBotsData(botsData: BotData[]) {
    this.store.set('bots', botsData);
    this.window.webContents.send('botListChange', this.getBotsData());
  }

  getBotsData(): BotData[] {
    let botsData = this.store.get('bots');
    if (botsData === undefined) {
      this.setBotsData((botsData = []));
    }
    return botsData as BotData[];
  }
}
