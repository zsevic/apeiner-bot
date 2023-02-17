const { CHAT_ID, defaultAdminReply } = require('../constants');
const adminService = require('../services/admin-service');
const userService = require('../services/user-service');

async function HandleMessage(context) {
  const chatId = context.event._rawEvent.message?.chat?.id;
  if (process.env.NODE_ENV === 'dev' || chatId !== CHAT_ID) {
    const response = await userService.getResponseMessage(context);
    return context.sendMessage(response, {
      parseMode: 'HTML',
    });
  }

  const responseMessage = await adminService.getResponse(context);
  await context.sendMessage(responseMessage, defaultAdminReply);
}

module.exports = {
  HandleMessage,
};
