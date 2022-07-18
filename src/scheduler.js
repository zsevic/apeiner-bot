const { getClient } = require('bottender');
const { CronJob } = require('cron');
const { CHAT_ID, replyMarkup } = require('./constants');
const { logger } = require('./logger');
const { handleMessage } = require('./services');
const { getTime } = require('./utils');

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
      await client.sendMessage(CHAT_ID, statusMessage);
      const response = await handleMessage(time);

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
