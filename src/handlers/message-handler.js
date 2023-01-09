const { replyMarkup, CHAT_ID } = require('../constants');
const { logger } = require('../logger');
const { handleMessage } = require('../services');
const userService = require('../services/user-service');
const { getStatusMessage, getTime } = require('../utils');

async function HandleMessage(context) {
  const chatId = context.event._rawEvent.message?.chat?.id;
  if (process.env.NODE_ENV === 'dev' || chatId !== CHAT_ID) {
    return userService.handleMessage(context);
  }

  const isBotCommand = !!context.event._rawEvent.message?.entities?.find(
    (entity) => entity.type === 'bot_command'
  );
  const message = isBotCommand
    ? context.event.text.replace('/', '')
    : context.event.text;
  const time = getTime(message);
  const [, minutes] = time;
  const statusMessage = getStatusMessage(minutes);
  logger.info(statusMessage);
  await context.sendMessage(statusMessage);
  const response = await handleMessage(...time);

  await context.sendMessage(response, {
    parseMode: 'HTML',
    replyMarkup,
  });
}

module.exports = {
  HandleMessage,
};
