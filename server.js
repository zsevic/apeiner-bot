const { bottender } = require('bottender');
const ngrok = require('ngrok');
const shell = require('shelljs');
const { setupCustomServer } = require('./src/custom-server');
const { logger } = require('./src/logger');
const { setupScheduler } = require('./src/scheduler');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const setWebhookUrl = (url) =>
  shell.exec(`npm run telegram-webhook:set ${url}/webhooks/telegram`);

const connectToTunnel = async (port) => {
  const url = await ngrok.connect({
    addr: port,
    onStatusChange: (status) => {
      switch (status) {
        case 'connected': {
          logger.info('Connected to tunnel...');
          break;
        }
        case 'closed': {
          logger.warn('Connection to tunnel is closed...');
          logger.info('Reconnecting...');
          return connectToTunnel(port);
        }
      }
    },
  });
  setWebhookUrl(url);
};

(async () => {
  try {
    await app.prepare();
    const port = Number(process.env.PORT) || 5000;
    setupCustomServer(app, port);

    if (process.env.NODE_ENV !== 'production') {
      await connectToTunnel(port);
    }

    setupScheduler();
  } catch (error) {
    logger.error(error, 'Setting up failed...');
  }
})();
