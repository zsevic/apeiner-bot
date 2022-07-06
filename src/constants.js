const COLLECTIONS_TO_ANALYZE = 7;
const MAX_TOTAL_SUPPLY = 10000;
const MIN_FLOOR_PRICE = 0.01;
const MIN_VOLUME = 20;
const PROTOCOLS = ['ERC721', 'ERC1155'];

const headers = {
  'x-api-key': process.env.OPENSEA_API_KEY,
};

module.exports = {
  COLLECTIONS_TO_ANALYZE,
  headers,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_VOLUME,
  PROTOCOLS,
};
