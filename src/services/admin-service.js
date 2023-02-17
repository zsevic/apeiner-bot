const { getMessage, getResponseMessage } = require('./index');
const { getStatusMessage, getTime, isValidWalletAddress } = require('../utils');
const { logger } = require('../logger');
const userRepository = require('../gateways/user-repository');
const { INVALID_WALLET_MESSAGE } = require('../constants');

const handleSubscription = async (message) => {
  const [, walletAddress] = message.split(' ');
  if (!isValidWalletAddress(walletAddress)) {
    return INVALID_WALLET_MESSAGE;
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
 * @param {string} message
 * @returns {string}
 */
const handleUsers = async (message) => {
  const [, operation] = message.split(' ');
  if (!operation) {
    return 'Command is not valid';
  }

  if (operation === 'stats') {
    const total = await userRepository.getNumberOfUsers();
    const subscribed = await userRepository.getNumberOfSubscribedUsers();
    const active = await userRepository.getNumberOfActiveUsers();
    return `${total} total user(s), ${subscribed} subscribed, ${active} active`;
  }
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

  if (message.startsWith('users')) {
    return handleUsers(message);
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
