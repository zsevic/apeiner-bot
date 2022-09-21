const { bottender } = require('bottender');
const ngrok = require('ngrok');
const shell = require('shelljs');
const { setupCustomServer } = require('./src/custom-server');
const { setupScheduler } = require('./src/scheduler');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const setUrl = (url) =>
  shell.exec(`npm run telegram-webhook:set ${url}/webhooks/telegram`);

(async () => {
  try {
    await app.prepare();
    const port = Number(process.env.PORT) || 5000;
    setupCustomServer(app, port);

    let url;
    url = await ngrok.connect({
      addr: port,
      onStatusChange: async (status) => {
        if (status === 'closed') {
          console.log('tunnel is closing, reconnecting...');
          url = await ngrok.connect(port);
          setUrl(url);
          console.log('reconnected...');
        }
      },
    });
    setUrl(url);

    setupScheduler();
  } catch (error) {
    console.error(error);
  }
})();
