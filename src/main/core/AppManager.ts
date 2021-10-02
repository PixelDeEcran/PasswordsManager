import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import BotsManager from './BotsManager';
import PasswordsManager from './PasswordsManager';

export default class AppManager {
  store: Store | undefined;

  botsManager: BotsManager | undefined;

  passwordsManager: PasswordsManager | undefined;

  start(window: BrowserWindow): void {
    this.store = new Store();

    this.botsManager = new BotsManager(this.store, window);
    this.passwordsManager = new PasswordsManager(window, this.botsManager);
    this.botsManager.setPasswordsManager(this.passwordsManager);
  }
}
