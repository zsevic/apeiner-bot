const { getMessage, getResponseMessage } = require('./index');
const { getStatusMessage, getTime, isValidWalletAddress } = require('../utils');
const { logger } = require('../logger');
const userRepository = require('../gateways/user-repository');

const handleSubscription = async (message) => {
  const [, walletAddress] = message.split(' ');
  if (!isValidWalletAddress(walletAddress)) {
    return `Wallet address is not valid, please try again`;
  }

  const user = await userRepository.getUserByWalletAddress(walletAddress);
  if (!user) {
    return 'User is not found';
  }
  await userRepository.subscribe(walletAddress);
  return 'User is subscribed successfully';
};

/**
 *
 * @param {*} context
 * @returns {string}
 */
const getResponse = async (context) => {
  const message = getMessage(context);
  if (message.startsWith('subscribe')) {
    return handleSubscription(message);
  }

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
