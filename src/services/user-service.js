const { getClient } = require('bottender');
const {
  PAUSED_DEFAULT_MESSAGE,
  ACTIVATED_DEFAULT_MESSAGE,
  ACTIVATION_IN_PROGRESS_MESSAGE,
  ACTIVATION_MESSAGE,
  INVALID_WALLET_MESSAGE,
  SETTING_WALLET_ADDRESS_FEEDBACK_MESSAGE,
  CHAT_ID,
  ALREADY_USED_WALLET_ADDRESS_MESSAGE,
} = require('../constants');
const userRepository = require('../gateways/user-repository');
const { getStatusMessage, getTime, isValidWalletAddress } = require('../utils');
const service = require('./');
const client = getClient('telegram');

/**
 *
 * @param {*} context
 * @param {number} userId
 * @returns {Promise<string>}
 */
const getResponseMessageForNewUser = async (context, userId) => {
  const newUser = {
    id: userId,
    username: context.event._rawEvent.message?.chat?.username,
  };
  await userRepository.saveUser(newUser);
  return getLatestStats(context, userId);
};

/**
 *
 * @param {*} context
 * @param {number} userId
 * @returns {string}
 */
const getLatestStats = async (context, userId) => {
  const time = getTime('1');
  const [, minutes] = time;
  const statusMessage = getStatusMessage(minutes);
  await context.sendMessage(statusMessage);
  return service.getResponseMessage(...time, userId);
};

/**
 *
 * @param {*} context
 * @returns {Promise<string>}
 */
const getResponseMessage = async (context) => {
  const userId = context.event._rawEvent.message?.chat?.id;
  const user = await userRepository.getUserById(userId);
  if (!user) {
    return getResponseMessageForNewUser(context, userId);
  }

  if (user.is_subscribed && user.is_active) {
    const message = service.getMessage(context);
    if (message === 'pause') {
      await userRepository.pause(userId);
      return PAUSED_DEFAULT_MESSAGE;
    }
    return ACTIVATED_DEFAULT_MESSAGE;
  }

  if (user.is_subscribed && !user.is_active) {
    const message = service.getMessage(context);
    if (message === 'activate') {
      await userRepository.activate(userId);
      return ACTIVATED_DEFAULT_MESSAGE;
    }
    return PAUSED_DEFAULT_MESSAGE;
  }

  if (user.is_trial_active) {
    const time = getTime('1');
    const [, minutes] = time;
    const statusMessage = getStatusMessage(minutes);
    await context.sendMessage(statusMessage);
    return service.getResponseMessage(...time, userId);
  }

  const message = service.getMessage(context);
  if (message.startsWith('activate') || message.startsWith('update')) {
    const [, walletAddress] = message.split(' ');
    if (!isValidWalletAddress(walletAddress)) {
      return INVALID_WALLET_MESSAGE;
    }

    const isWalletAddressAlreadyUsed =
      await userRepository.isWalletAddressAlreadyUsed(userId, walletAddress);
    if (isWalletAddressAlreadyUsed) {
      return ALREADY_USED_WALLET_ADDRESS_MESSAGE;
    }

    await userRepository.setWalletAddress(userId, walletAddress);
    if (process.env.NODE_ENV !== 'test') {
      await client.sendMessage(CHAT_ID, `New user: ${walletAddress}`);
    }
    return SETTING_WALLET_ADDRESS_FEEDBACK_MESSAGE;
  }

  if (user.wallet_address) {
    return ACTIVATION_IN_PROGRESS_MESSAGE;
  }

  return ACTIVATION_MESSAGE;
};

module.exports = {
  getResponseMessage,
};
