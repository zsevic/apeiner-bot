const { getClient } = require('bottender');
const { CHAT_ID, ERROR_MESSAGE } = require('./src/constants');
const { logger } = require('./src/logger');
const client = getClient('telegram');

module.exports = async (context, props) => {
  logger.error(props.error);

  await context.sendMessage(ERROR_MESSAGE);

  if (process.env.NODE_ENV === 'production') {
    client.sendMessage(CHAT_ID, props.error.stack);
  }
};
