const COLLECTIONS_TO_ANALYZE = 7;
const ETH = 'ETH';
const WETH = 'WETH';
const MIN_TOTAL_SUPPLY = 1000;
const MAX_TOTAL_SUPPLY = 10001;
const MIN_FLOOR_PRICE = 0.01;
const MIN_VOLUME = 20;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const PROTOCOLS = ['ERC721', 'ERC1155'];
const TIMEZONE = 'Europe/Belgrade';

const CHAT_ID = 1618850255;

const headers = {
  'x-api-key': process.env.OPENSEA_API_KEY,
};

const replyMarkup = {
  keyboard: [
    [
      {
        text: '/1',
      },
      {
        text: '/2',
      },
      {
        text: '/3',
      },
      {
        text: '/5',
      },
      {
        text: '/10',
      },
    ],
  ],
};

module.exports = {
  CHAT_ID,
  COLLECTIONS_TO_ANALYZE,
  ETH,
  WETH,
  headers,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_TOTAL_SUPPLY,
  MIN_VOLUME,
  NULL_ADDRESS,
  PROTOCOLS,
  replyMarkup,
  TIMEZONE,
};
