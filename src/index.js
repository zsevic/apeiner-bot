const { handleMessage } = require('./services');

module.exports = async function App(context) {
  let textMessage;
  if (context.event.isText) {
    textMessage = context.event.text;
  }
  const response = await handleMessage(textMessage);

  await context.sendMessage(response, {
    parseMode: 'HTML',
  });
};
