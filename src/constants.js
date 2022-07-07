const COLLECTIONS_TO_ANALYZE = 7;
const MIN_TOTAL_SUPPLY = 1000;
const MAX_TOTAL_SUPPLY = 10000;
const MIN_FLOOR_PRICE = 0.01;
const MIN_VOLUME = 20;
const PROTOCOLS = ['ERC721', 'ERC1155'];
const TIMEZONE = 'Europe/Belgrade';

const headers = {
  'x-api-key': process.env.OPENSEA_API_KEY,
};

const replyMarkup = {
  keyboard: [
    [
      {
        text: 1,
      },
      {
        text: 2,
      },
      {
        text: 3,
      },
      {
        text: 5,
      },
      {
        text: 10,
      },
    ],
  ],
};

module.exports = {
  COLLECTIONS_TO_ANALYZE,
  headers,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_TOTAL_SUPPLY,
  MIN_VOLUME,
  PROTOCOLS,
  replyMarkup,
  TIMEZONE,
};
