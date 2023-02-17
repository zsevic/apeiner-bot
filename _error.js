const { getClient } = require('bottender');
const { CHAT_ID } = require('./src/constants');
const { logger } = require('./src/logger');
const client = getClient('telegram');

module.exports = async (context, props) => {
  logger.error(props.error);

  await context.sendMessage(
    'There are some unexpected errors that happened. Please try again later. Sorry for the inconvenience.'
  );

  if (process.env.NODE_ENV === 'production') {
    client.sendMessage(CHAT_ID, props.error.stack);
  }
};
