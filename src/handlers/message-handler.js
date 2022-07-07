const { replyMarkup } = require('../constants');
const { handleMessage } = require('../services');

async function HandleMessage(context) {
  const isBotCommand = !!context.event._rawEvent.message?.entities?.find(
    (entity) => entity.type === 'bot_command'
  );
  const message = isBotCommand
    ? context.event.text.replace('/', '')
    : context.event.text;
  const response = await handleMessage(message);

  await context.sendMessage(response, {
    parseMode: 'HTML',
    replyMarkup,
  });
}

module.exports = {
  HandleMessage,
};
