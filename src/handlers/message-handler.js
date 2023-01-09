const { replyMarkup, CHAT_ID } = require('../constants');
const { logger } = require('../logger');
const { handleMessage } = require('../services');
const userService = require('../services/user-service');
const { getTime } = require('../utils');

async function HandleMessage(context) {
  const chatId = context.event._rawEvent.message?.chat?.id;
  if (chatId !== CHAT_ID) {
    await userService.handleMessage(context);
    return;
  }

  const isBotCommand = !!context.event._rawEvent.message?.entities?.find(
    (entity) => entity.type === 'bot_command'
  );
  const message = isBotCommand
    ? context.event.text.replace('/', '')
    : context.event.text;
  const time = getTime(message);
  const [, minutes] = time;
  const statusMessage = `Getting stats for last ${minutes} minute${
    minutes !== 1 ? 's' : ''
  }...`;
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
