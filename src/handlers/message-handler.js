const { replyMarkup } = require('../constants');
const { handleMessage } = require('../services');

async function HandleMessage(context) {
  const response = await handleMessage(context.event.text);

  await context.sendMessage(response, {
    parseMode: 'HTML',
    replyMarkup,
  });
}

module.exports = {
  HandleMessage,
};
