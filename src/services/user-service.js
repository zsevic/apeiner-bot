const { utils } = require('ethers');
const {
  PAUSED_DEFAULT_MESSAGE,
  ACTIVATED_DEFAULT_MESSAGE,
} = require('../constants');
const userRepository = require('../gateways/user-repository');
const { getStatusMessage, getTime } = require('../utils');
const service = require('./');

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
    if (!walletAddress || (!walletAddress.endsWith('.eth') && !utils.isAddress(walletAddress))) {
      return `Wallet address is not valid, please try again`;
    }

    await userRepository.setWalletAddress(userId, walletAddress);
    return `Thanks for setting the wallet address, Apeiner will be activated once we verify the whole registration process`;
  }

  if (user.wallet_address) {
    return `Apeiner will be activated once we verify the whole registration process\n\nYou can update the wallet address by sending the message in the following format: \n/update [YOUR WALLET ADDRESS]`;
  }

  return 'In order to activate apeiner, send 0.05ETH to apeiner.eth\n\nAfter you complete the first step, send the message in the following format: \n/activate [YOUR WALLET ADDRESS]\n\nfor example: /activate 0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
};

module.exports = {
  getResponseMessage,
};
