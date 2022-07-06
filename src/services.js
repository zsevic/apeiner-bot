const axios = require('axios');
const { headers, PROTOCOLS } = require('./constants');
const { logger } = require('./logger');

const formatResponse = (filteredCollections) =>
  filteredCollections
    .map((result) => {
      const uniqueBuyers = [...new Set(result[1].buyers)].length;
      return `<a href="https://opensea.io/collection/${result[1].slug}">${
        result[0]
      }</a>: ${result[1].numberOfSales} sale${
        result[1].numberOfSales > 1 ? 's' : ''
      }\nunique buyers: ${uniqueBuyers}\n${
        result[1].isUnrevealed ? 'UNREVEALED\n' : ''
      }floor: ${result[1].floorPrice}eth\naverage price: ${
        result[1].averagePrice
      }eth\ntotal volume: ${result[1].totalVolume}eth\nlisted/supply: ${
        result[1].numberOfListed
      }/${result[1].totalSupply}\nowners/supply: ${result[1].numberOfOwners}/${
        result[1].totalSupply
      }\n`;
    })
    .join('\n');

const getList = async (date) => {
  let next;
  let requestNumber = 0;
  let newItems = 0;

  const results = {};
  do {
    const queryParams = {
      event_type: 'successful',
      occurred_after: Math.floor(date.getTime() / 1000),
      ...(next && { cursor: next }),
    };
    logger.info(`Sending ${requestNumber + 1}. request...`);
    const response = await axios('https://api.opensea.io/api/v1/events', {
      params: queryParams,
      headers,
    }).then((res) => res.data);
    next = response.next;
    newItems = response.asset_events.length || 0;
    response.asset_events.forEach((event) => {
      const schemaNema = event.asset?.asset_contract?.schema_name;
      if (!PROTOCOLS.includes(schemaNema)) {
        return;
      }
      const collectionName = event.asset?.collection?.name;
      if (!collectionName) return;
      const buyer = event.winner_account.address;
      if (results[collectionName]) {
        results[collectionName].buyers.push(buyer);
        return (results[collectionName].numberOfSales += 1);
      }
      return (results[collectionName] = {
        slug: event.asset?.collection?.slug,
        buyers: [buyer],
        numberOfSales: 1,
      });
    });
    requestNumber += 1;
    logger.info(
      `Got ${response.asset_events.length} events, finished ${requestNumber}. request`
    );
  } while (next && newItems !== 0);

  return results;
};

module.exports = {
  formatResponse,
  getList,
};
