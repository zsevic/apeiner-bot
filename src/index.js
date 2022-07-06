const { handleMessage } = require('./services');

module.exports = async function App(context) {
  const textMessage = context._requestContext?.body?.message?.text;
  const response = await handleMessage(textMessage);

  await context.sendMessage(response, {
    parseMode: 'HTML',
  });
};
