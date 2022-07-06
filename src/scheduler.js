const { getClient } = require('bottender');

const client = getClient('telegram');

client.sendMessage('1618850255', 'hello!');
