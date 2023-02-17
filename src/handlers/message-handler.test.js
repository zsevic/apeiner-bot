const { HandleMessage } = require('./message-handler');
const { CHAT_ID, replyMarkup, defaultAdminReply } = require('../constants');
const userRepository = require('../gateways/user-repository');

describe('HandleMessage', () => {
  describe('/users command', () => {
    it('should return response command is not valid', async () => {
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

      expect(context.sendMessage).toBeCalledWith('Command is not valid', {
        parseMode: 'HTML',
        replyMarkup,
      });
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
      jest.spyOn(userRepository, 'getNumberOfSubscribedUsers').mockResolvedValue(1);
      jest.spyOn(userRepository, 'getNumberOfActiveUsers').mockResolvedValue(1);

      await HandleMessage(context);

      expect(context.sendMessage).toBeCalledWith('2 total user(s), 1 subscribed, 1 active', defaultAdminReply);
    });
  });
});
