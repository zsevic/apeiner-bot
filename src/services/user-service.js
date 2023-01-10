const userRepository = require('../gateways/user-repository');
const { getStatusMessage, getTime } = require('../utils');
const service = require('./');

const getResponseMessage = async (context) => {
  const userId = context.event._rawEvent.message?.chat?.id;
  const user = await userRepository.getUserById(userId);
  if (!user) {
    const newUser = {
      id: userId,
      username: context.event._rawEvent.message?.chat?.username,
    };
    await userRepository.saveUser(newUser);
    const time = getTime('1');
    const [, minutes] = time;
    const statusMessage = getStatusMessage(minutes);
    await context.sendMessage(statusMessage);
    return service.getResponseMessage(...time, userId);
  }

  return 'In order to activate apeiner, send 0.05ETH to apeiner.eth\nAfter you complete the first step, send the message in the following format: \n/activate [YOUR WALLET ADDRESS]\nfor example: /activate 0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
};

module.exports = {
  getResponseMessage,
};
