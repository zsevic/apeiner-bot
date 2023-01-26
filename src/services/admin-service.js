const { getMessage, getResponseMessage } = require('./index');
const { getStatusMessage, getTime } = require('../utils');
const { logger } = require('../logger');

/**
 * 
 * @param {*} context 
 * @returns {string}
 */
const getResponse = async (context) => {
  const message = getMessage(context);  
  const time = getTime(message);
  const [, minutes] = time;
  const statusMessage = getStatusMessage(minutes);
  logger.info(statusMessage);
  await context.sendMessage(statusMessage);
  return getResponseMessage(...time);
};

module.exports = {
  getResponse,
};
