import { RateLimiter } from 'limiter';
import { TableBody } from 'material-ui';

import { BotData, UpdateStatutResult } from './Types';

const superagent = require('superagent');

export default class Bot {
  botData: BotData;

  limiter: RateLimiter;

  constructor(botData: BotData) {
    this.botData = botData;
    this.limiter = new RateLimiter({
      tokensPerInterval: 4,
      interval: 10000,
    });
  }

  queueRequest(request: Promise<any>) {
    return this.limiter.removeTokens(1).then((remaining) => {
      return request;
    });
  }

  logging(result: UpdateStatutResult): Promise<UpdateStatutResult> {
    return new Promise((resolve) => {
      this.queueRequest(
        superagent
          .get('https://discord.com/api/v9/users/@me')
          .set('Accept', '*/*')
          .set('User-Agent', 'DiscordBot')
          .set('Authorization', `Bot ${this.botData.token}`)
      )
        .then(
          (res: {
            body: {
              username: string;
              avatar: string | null;
              discriminator: string;
              id: string;
            };
          }) => {
            result.logging.success = true;

            this.botData.lastName = res.body.username;
            this.botData.lastAvatarURL = `https://cdn.discordapp.com/${
              res.body.avatar === null
                ? `embed/avatars/${
                    parseInt(res.body.discriminator, 10) % 5
                  }.png`
                : `avatars/${res.body.id}/${res.body.avatar}.png`
            }`;

            resolve(result);
            return result;
          }
        )
        .catch((error: string) => {
          result.logging.success = false;
          result.logging.errorMessage = error;

          resolve(result);
        });
    });
  }

  searchChannel(result: UpdateStatutResult): Promise<UpdateStatutResult> {
    return new Promise((resolve) => {
      this.queueRequest(
        superagent
          .get(
            `https://discord.com/api/v9/channels/${this.botData.ledgerChannelId}`
          )
          .set('Accept', '*/*')
          .set('User-Agent', 'DiscordBot')
          .set('Authorization', `Bot ${this.botData.token}`)
      )
        .then(
          (respond: {
            body: {
              name: string;
            };
          }) => {
            result.channelSearch.success = true;

            this.botData.lastLedgerChannelName = respond.body.name;

            resolve(result);
            return result;
          }
        )
        .catch((error: string) => {
          result.logging.success = false;
          result.logging.errorMessage = error;

          resolve(result);
        });
    });
  }

  getAllMessages(messages: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let query = null;

      if (messages.length > 0) {
        query = {
          limit: 100,
          before: messages[messages.length - 1].id,
        };
      } else {
        query = {
          limit: 100,
        };
      }

      this.queueRequest(
        superagent
          .get(
            `https://discord.com/api/v9/channels/${this.botData.ledgerChannelId}/messages`
          )
          .set('Accept', '*/*')
          .set('User-Agent', 'DiscordBot')
          .set('Authorization', `Bot ${this.botData.token}`)
          .query(query)
      )
        .then((respond: { body: any[] }) => {
          messages.push(...respond.body);

          if (respond.body.length === 100) {
            this.getAllMessages(messages)
              .then((messagesResult: any[]) => resolve(messagesResult))
              .catch((error: string) => {
                reject(error);
              });
          } else {
            resolve(messages);
          }

          return respond;
        })
        .catch((error: string) => {
          reject(error);
        });
    });
  }

  sendMessage(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queueRequest(
        superagent
          .post(
            `https://discord.com/api/v9/channels/${this.botData.ledgerChannelId}/messages`
          )
          .send({
            content: message,
          })
          .set('Accept', '*/*')
          .set('User-Agent', 'DiscordBot')
          .set('Authorization', `Bot ${this.botData.token}`)
      )
        .then((respond: { body: unknown }) => {
          return respond.body;
        })
        .catch((error: string) => {
          reject(error);
        });
    });
  }

  updateStatut(): Promise<UpdateStatutResult> {
    return Promise.resolve({
      logging: {
        success: false,
      },
      channelSearch: {
        success: false,
      },
    })
      .then((result: UpdateStatutResult) => {
        return this.logging(result);
      })
      .then((result: UpdateStatutResult) => {
        return this.searchChannel(result);
      });
  }
}
