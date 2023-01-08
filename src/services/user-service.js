const handleMessage = async (context) => {
  await context.sendMessage('Access denied!');
};

module.exports = {
  handleMessage,
};
