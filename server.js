const { bottender } = require('bottender');
const ngrok = require('ngrok');
const shell = require('shelljs');
const { setupCustomServer } = require('./src/custom-server');
const { setupScheduler } = require('./src/scheduler');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const setWebhookUrl = (url) =>
  shell.exec(`npm run telegram-webhook:set ${url}/webhooks/telegram`);

(async () => {
  let url;
  let port;
  try {
    await app.prepare();
    port = Number(process.env.PORT) || 5000;
    setupCustomServer(app, port);

    url = await ngrok.connect(port);
    setWebhookUrl(url);

    setupScheduler();
  } catch (error) {
    console.error(error);
    if (
      error?.body?.error_code === 103 &&
      error?.body?.msg === 'failed to start tunnel'
    ) {
      url = await ngrok.connect(port);
      setWebhookUrl(url);
    }
  }
})();
