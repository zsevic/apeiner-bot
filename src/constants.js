const COLLECTIONS_TO_ANALYZE = 7;
const ETH = 'ETH';
const WETH = 'WETH';
const MIN_TOTAL_SUPPLY = 1000;
const MAX_TOTAL_SUPPLY = 10005;
const MIN_FLOOR_PRICE = 0.01;
const MIN_VOLUME = 20;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const PROTOCOLS = ['ERC721', 'ERC1155'];
const DATETIME_FORMAT = 'en-GB';
const TIMEZONE = 'Europe/Belgrade';

const CHAT_ID = 1618850255;

const PAUSED_DEFAULT_MESSAGE = `Apeiner is paused, if you want to activate it, reply with /activate message`;
const ACTIVATED_DEFAULT_MESSAGE = `Apeiner is activated, if you want to pause it, reply with /pause message`;

const headers = {
  accept: '*/*',
  'content-type': 'application/json',
  'x-build-id': '7c4e8c11cb0844796e38aa3cf13f29e1221267b3',
};
const OPENSEA_API_BASE_URL = 'https://opensea.io/__api/graphql/';
const COLLECTION_RETRIEVAL_COUNTER = 32;

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
  ACTIVATED_DEFAULT_MESSAGE,
  CHAT_ID,
  COLLECTIONS_TO_ANALYZE,
  COLLECTION_RETRIEVAL_COUNTER,
  DATETIME_FORMAT,
  ETH,
  WETH,
  headers,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_TOTAL_SUPPLY,
  MIN_VOLUME,
  NULL_ADDRESS,
  OPENSEA_API_BASE_URL,
  PAUSED_DEFAULT_MESSAGE,
  PROTOCOLS,
  replyMarkup,
  TIMEZONE,
};
