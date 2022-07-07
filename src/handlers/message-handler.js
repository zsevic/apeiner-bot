const { handleMessage } = require('../services');

async function HandleMessage(context) {
  const response = await handleMessage(context.event.text);

  await context.sendMessage(response, {
    parseMode: 'HTML',
  });
}

module.exports = {
  HandleMessage,
};
