const { getClient } = require('bottender');
const { CronJob } = require('cron');
const { replyMarkup } = require('./constants');
const { logger } = require('./logger');
const { handleMessage } = require('./services');
const { getTime } = require('./utils');

const client = getClient('telegram');
const chatId = '1618850255';

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
      await client.sendMessage(chatId, statusMessage);
      const response = await handleMessage(time);

      await client.sendMessage(chatId, response, {
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
