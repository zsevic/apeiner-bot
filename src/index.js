const { router, telegram } = require('bottender/router');
const { HandleMessage } = require('./handlers/message-handler');

module.exports = async function App() {
  return router([telegram.message(HandleMessage)]);
};
