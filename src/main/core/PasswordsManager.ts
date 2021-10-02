import { BrowserWindow, ipcMain } from 'electron';
import crypto from 'crypto';
import BotsManager from './BotsManager';
import { PasswordData } from './Types';

export default class PasswordManager {
  window: BrowserWindow;

  botsManager: BotsManager;

  passwords: PasswordData[];

  key: string | null;

  syncing: boolean;

  constructor(window: BrowserWindow, botsManager: BotsManager) {
    this.window = window;
    this.botsManager = botsManager;
    this.passwords = [];
    this.key = null;
    this.syncing = false;

    ipcMain.handle('acquirePasswords', async (event) => {
      let interval: NodeJS.Timeout | null = null;
      let tries = 0;

      const data = await new Promise((resolve) => {
        interval = setInterval(() => {
          if (!this.syncing || tries > 250) {
            clearInterval(interval as NodeJS.Timeout);
            resolve(this.passwords);
          }
          tries += 1;
        }, 20);
      });

      return data;
    });

    ipcMain.on('auth', (event, password) => {
      this.auth(password);

      this.sync();
    });
    ipcMain.on('updatePassword', (event, passwordData) => {
      this.setPasswordData(passwordData.serviceName, passwordData, true);
    });
    ipcMain.on('removePassword', (event, serviceName) => {
      this.setPasswordData(serviceName, null, true);
    });
    ipcMain.on('syncPasswords', (event) => {
      this.sync();
    });
  }

  auth(password: string | null) {
    if (password !== null) {
      this.key = crypto.createHash('md5').update(password).digest('hex');
    } else {
      this.key = null;
    }
  }

  sync(): void {
    if (
      this.botsManager.selectedBot !== null &&
      this.key !== null &&
      !this.syncing
    ) {
      this.syncing = true;
      this.botsManager.selectedBot
        .getAllMessages()
        .then((messages) => {
          return messages
            .map((message) => message.content)
            .map((message) => {
              return this.decryptMessage(message);
            })
            .filter((message) => {
              if (message !== null) {
                console.log(message);
              }
              return message !== null && message.startsWith('7ab7');
            })
            .map((message) => (message !== null ? message.slice(4) : ''));
        })
        .then((messages) => {
          messages.forEach((message) => {
            const buffer = Buffer.from(message, 'hex');
            const data = JSON.parse(buffer.toString('utf-8')) as PasswordData;

            this.parseMessage(data);
          });
          return messages;
        })
        .then((messages) => {
          this.passwords = this.passwords.filter(
            (password) => password.password !== null
          );
          this.syncing = false;
          return messages;
        })
        .catch((error) => {
          this.passwords = [];
          this.syncing = false;
          console.log(error);
        });
    } else {
      this.passwords = [];
    }
  }

  parseMessage(data: PasswordData) {
    if (
      this.passwords.find((other) => data.serviceName === other.serviceName) ===
      undefined
    ) {
      this.setPasswordData(data.serviceName, data, false, false);
    }
  }

  setPasswordData(
    serviceName: string,
    data: PasswordData | null,
    pushData = false,
    sendData = true
  ) {
    const otherData = this.passwords.find(
      (other) => serviceName === other.serviceName
    );

    if (otherData !== undefined) {
      this.passwords.splice(this.passwords.indexOf(otherData), 1);
    }

    if (data !== null) {
      this.passwords.push(data);
    }

    // 7ab7 are the first digits of pi in hexadecimal
    if (pushData && this.botsManager.selectedBot !== null) {
      const message = this.encryptMessage(
        `7ab7${Buffer.from(
          JSON.stringify(
            data !== null
              ? data
              : {
                  serviceName,
                  password: null,
                }
          ),
          'utf-8'
        ).toString('hex')}`
      );

      if (message !== null) {
        this.botsManager.selectedBot.sendMessage(message);
      }
    }

    if (sendData) {
      this.window.webContents.send('passwordListChange', this.passwords);
    }
  }

  encryptMessage(message: string): string | null {
    if (this.key === null) return 'null';

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.key),
      iv
    );
    let encrypted = cipher.update(message);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decryptMessage(message: string) {
    try {
      if (this.key === null) return null;

      const messageParts: string[] = message.split(':');
      if (messageParts.length <= 1) {
        return null;
      }

      const iv = Buffer.from(messageParts[0], 'hex');
      const encryptedMessage = Buffer.from(
        message.slice(messageParts[0].length + 1),
        'hex'
      );

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(this.key),
        iv
      );
      let decrypted = decipher.update(encryptedMessage);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      return null;
    }
  }
}
