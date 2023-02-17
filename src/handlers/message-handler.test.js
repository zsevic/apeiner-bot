const { CHAT_ID, replyMarkup } = require('../constants');
const { HandleMessage } = require('./message-handler');

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
  });
});
