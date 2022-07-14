const { bottender } = require('bottender');
const { setupCustomServer } = require('./src/custom-server');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

app.prepare().then(() => {
  setupCustomServer(app);
}).catch(console.error);