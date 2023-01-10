const { replyMarkup, CHAT_ID } = require('../constants');
const { logger } = require('../logger');
const userService = require('../services/user-service');
const { getResponseMessage, getMessage } = require('../services');
const { getStatusMessage, getTime } = require('../utils');

async function HandleMessage(context) {
  const chatId = context.event._rawEvent.message?.chat?.id;
  if (process.env.NODE_ENV === 'dev' || chatId !== CHAT_ID) {
    const response = await userService.getResponseMessage(context);
    return context.sendMessage(response, {
      parseMode: 'HTML',
    });
  }

  const message = getMessage(context);
  const time = getTime(message);
  const [, minutes] = time;
  const statusMessage = getStatusMessage(minutes);
  logger.info(statusMessage);
  await context.sendMessage(statusMessage);
  const response = await getResponseMessage(...time);

  await context.sendMessage(response, {
    parseMode: 'HTML',
    replyMarkup,
  });
}

module.exports = {
  HandleMessage,
};
