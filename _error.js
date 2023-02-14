const { logger } = require('./src/logger');

module.exports = handleError = async (context, props) => {
  logger.error(props.error);

  await context.sendMessage(
    'There are some unexpected errors happened. Please try again later, sorry for the inconvenience.'
  );
};
