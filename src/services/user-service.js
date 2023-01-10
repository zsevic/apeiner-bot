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
      return `Apeiner is paused, if you want to activate it, reply with /activate message`;
    }
    return `Apeiner is activated, if you want to pause it, reply with /pause message`;
  }

  if (user.is_subscribed && !user.is_active) {
    const message = service.getMessage(context);
    if (message === 'activate') {
      await userRepository.activate(userId);
      return `Apeiner is activated, if you want to pause it, reply with /pause message`;
    }
    return `Apeiner is paused, if you want to activate it, reply with /activate message`;
  }

  if (user.is_trial_active) {
    const time = getTime('1');
    const [, minutes] = time;
    const statusMessage = getStatusMessage(minutes);
    await context.sendMessage(statusMessage);
    return service.getResponseMessage(...time, userId);
  }

  return 'In order to activate apeiner, send 0.05ETH to apeiner.eth\n\nAfter you complete the first step, send the message in the following format: \n/activate [YOUR WALLET ADDRESS]\n\nfor example: /activate 0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
};

module.exports = {
  getResponseMessage,
};
