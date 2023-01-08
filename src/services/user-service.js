const userRepository = require('../gateways/user-repository');

const handleMessage = async (context) => {
  const userId = context.event._rawEvent.message?.chat?.id;
  const user = await userRepository.getUserById(userId);
  if (!user) {
    const newUser = {
      id: userId,
      username: context.event._rawEvent.message?.chat?.username,
    };
    await userRepository.saveUser(newUser);
  }

  await context.sendMessage('Access denied!');
};

module.exports = {
  handleMessage,
};
