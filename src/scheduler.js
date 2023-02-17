const { getClient } = require('bottender');
const { CronJob } = require('cron');
const { CHAT_ID, replyMarkup, defaultUserReply } = require('./constants');
const { logger } = require('./logger');
const { getResponseMessage } = require('./services');
const { getTime } = require('./utils');
const userRepository = require('./gateways/user-repository');

const client = getClient('telegram');

const setupScheduler = () =>
  new CronJob(
    '* * * * *',
    async function () {
      const time = getTime('1');
      const [, minutes] = time;
      const statusMessage = `Getting stats for last ${minutes} minute${
        minutes !== 1 ? 's' : ''
      }...`;
      logger.info(statusMessage);

      const subscribedUsersId = await userRepository.getSubscribedUserIds();
      await Promise.all(
        subscribedUsersId
          .filter((userId) => userId !== CHAT_ID)
          .map((userId) =>
            client
              .sendMessage(userId, statusMessage, defaultUserReply)
              .catch((error) => logger.warn(error))
          )
      );
      await client.sendMessage(CHAT_ID, statusMessage);

      const response = await getResponseMessage(...time);
      await Promise.all(
        subscribedUsersId
          .filter((userId) => userId !== CHAT_ID)
          .map((userId) =>
            client
              .sendMessage(userId, response, {
                parseMode: 'HTML',
              })
              .catch((error) => logger.warn(error))
          )
      );
      await client.sendMessage(CHAT_ID, response, {
        parseMode: 'HTML',
        replyMarkup,
      });
    },
    null,
    true,
    'Europe/Belgrade'
  );

module.exports = {
  setupScheduler,
};
