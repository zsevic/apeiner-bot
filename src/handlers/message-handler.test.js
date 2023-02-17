const { HandleMessage } = require('./message-handler');
const { CHAT_ID, defaultAdminReply } = require('../constants');
const nftApi = require('../gateways/nft-api');
const userRepository = require('../gateways/user-repository');
const utils = require('../utils');

describe('HandleMessage', () => {
  describe('/users command', () => {
    it('should return error message command is not valid', async () => {
      const context = {
        event: {
          text: '/users',
          _rawEvent: {
            message: {
              entities: [
                {
                  type: 'bot_command',
                },
              ],
              chat: {
                id: CHAT_ID,
              },
            },
          },
        },
        sendMessage: jest.fn(),
      };

      await HandleMessage(context);

      expect(context.sendMessage).toBeCalledWith(
        'Command is not valid',
        defaultAdminReply
      );
    });

    it('should return user stats', async () => {
      const context = {
        event: {
          text: '/users stats',
          _rawEvent: {
            message: {
              entities: [
                {
                  type: 'bot_command',
                },
              ],
              chat: {
                id: CHAT_ID,
              },
            },
          },
        },
        sendMessage: jest.fn(),
      };
      jest.spyOn(userRepository, 'getNumberOfUsers').mockResolvedValue(2);
      jest
        .spyOn(userRepository, 'getNumberOfSubscribedUsers')
        .mockResolvedValue(1);
      jest.spyOn(userRepository, 'getNumberOfActiveUsers').mockResolvedValue(1);

      await HandleMessage(context);

      expect(context.sendMessage).toBeCalledWith(
        '2 total user(s), 1 subscribed, 1 active',
        defaultAdminReply
      );
    });
  });

  describe('/subscribe command', () => {
    it('should return error message when wallet address is not valid', async () => {
      const context = {
        event: {
          text: '/subscribe 0xb794f5ea0ba39494ce839613fffba7427957926w',
          _rawEvent: {
            message: {
              entities: [
                {
                  type: 'bot_command',
                },
              ],
              chat: {
                id: CHAT_ID,
              },
            },
          },
        },
        sendMessage: jest.fn(),
      };

      await HandleMessage(context);

      expect(context.sendMessage).toBeCalledWith(
        'Wallet address is not valid, please try again',
        defaultAdminReply
      );
    });

    it('should return error message when user is not found', async () => {
      const context = {
        event: {
          text: '/subscribe 0xb794f5ea0ba39494ce839613fffba74279579268',
          _rawEvent: {
            message: {
              entities: [
                {
                  type: 'bot_command',
                },
              ],
              chat: {
                id: CHAT_ID,
              },
            },
          },
        },
        sendMessage: jest.fn(),
      };
      jest
        .spyOn(userRepository, 'getUserByWalletAddress')
        .mockResolvedValue(null);

      await HandleMessage(context);

      expect(context.sendMessage).toBeCalledWith(
        'User is not found',
        defaultAdminReply
      );
    });

    it('should subscribe the user by given wallet address', async () => {
      const walletAddress = 'user.eth';
      const context = {
        event: {
          text: `/subscribe ${walletAddress}`,
          _rawEvent: {
            message: {
              entities: [
                {
                  type: 'bot_command',
                },
              ],
              chat: {
                id: CHAT_ID,
              },
            },
          },
        },
        sendMessage: jest.fn(),
      };
      jest.spyOn(userRepository, 'getUserByWalletAddress').mockResolvedValue({
        id: context.event._rawEvent.message.chat.id,
        username: 'user',
        wallet_address: walletAddress,
        is_subscribed: false,
        is_active: false,
        is_trial_active: false,
        created_at: '2023-01-26T22:37:33.220Z',
        updated_at: '2023-01-26T22:37:33.220Z',
      });
      jest.spyOn(userRepository, 'subscribe').mockResolvedValue(null);

      await HandleMessage(context);

      expect(context.sendMessage).toBeCalledWith(
        'User is subscribed successfully',
        defaultAdminReply
      );
    });
  });

  describe('/1 command', () => {
    it('should return default message when there are no events', async () => {
      const context = {
        event: {
          text: '/1',
          _rawEvent: {
            message: {
              entities: [
                {
                  type: 'bot_command',
                },
              ],
              chat: {
                id: CHAT_ID,
              },
            },
          },
        },
        sendMessage: jest.fn(),
      };
      jest.spyOn(nftApi, 'getEvents').mockResolvedValue(null);
      jest.spyOn(utils, 'getDate').mockReturnValue(new Date('2023-02-17'));

      await HandleMessage(context);

      expect(context.sendMessage).toHaveBeenNthCalledWith(
        1,
        'Getting stats for last 1 minute...'
      );
      expect(context.sendMessage).toHaveBeenNthCalledWith(
        2,
        'There are no bought NFTs in last 1 minute (after 1:00:00 AM)',
        defaultAdminReply
      );
    });
  });
});
