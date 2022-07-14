const { bottender } = require('bottender');
const { setupCustomServer } = require('./src/custom-server');
const { setupScheduler } = require('./src/scheduler');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

app
  .prepare()
  .then(() => {
    setupCustomServer(app);
    setupScheduler();
  })
  .catch(console.error);
