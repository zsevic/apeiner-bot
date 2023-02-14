const { logger } = require('./src/logger');

module.exports = handleError = async (context, props) => {
  logger.error(props.error);

  await context.sendMessage(
    'There are some unexpected errors that happened. Please try again later. Sorry for the inconvenience.'
  );
};
