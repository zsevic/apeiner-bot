const axios = require('axios');
const { headers } = require('./constants');
const { logger } = require('./logger');
const {
  addListingInfo,
  getCollections,
  getFilteredCollections,
  getSortedCollections,
  getMessageForEmptyList,
  getResponse,
} = require('./services');
const { isEmptyObject, getDate, getTime } = require('./utils');

module.exports = async function App(context) {
  try {
    const textMessage = context._requestContext?.body?.message?.text;
    const [seconds, minutes] = getTime(textMessage);

    const date = getDate(seconds);
    const collections = await getCollections(date);

    const sortedCollections = getSortedCollections(collections);
    if (sortedCollections.length === 0) {
      return context.sendMessage(getMessageForEmptyList(minutes, date));
    }
    logger.info('Getting collections info...');
    await Promise.all(
      sortedCollections.map(async (collectionItem) => {
        const url = `https://api.opensea.io/api/v1/collection/${collectionItem[1].slug}`;
        const collectionData = await axios(url, {
          headers,
        }).then((res) => res.data.collection);
        collectionItem[1].totalSupply = collectionData.stats.total_supply;
        collectionItem[1].numberOfOwners = collectionData.stats.num_owners;
        collectionItem[1].royalty =
          Number(collectionData.dev_seller_fee_basis_points) / 100;
        collectionItem[1].floorPrice =
          Number.parseFloat(collectionData.stats.floor_price).toFixed(3) * 1;
        collectionItem[1].totalVolume =
          Number.parseFloat(collectionData.stats.total_volume).toFixed(1) * 1;
        collectionItem[1].averagePrice =
          Number.parseFloat(collectionData.stats.average_price).toFixed(3) * 1;
        collectionItem[1].isUnrevealed = isEmptyObject(collectionData.traits);
        collectionItem[1].isEthereumCollection =
          !!collectionData.payment_tokens.find(
            (token) => token.symbol === 'ETH'
          );
      })
    );
    logger.info('Got collections info...');

    const filteredCollections = getFilteredCollections(sortedCollections);
    if (filteredCollections.length === 0) {
      return context.sendMessage(getMessageForEmptyList(minutes, date));
    }

    logger.info('Getting listings info...');
    await addListingInfo(filteredCollections);
    logger.info('Got listings info...');

    const response = getResponse(filteredCollections, minutes, date);
    await context.sendMessage(response, {
      parseMode: 'HTML',
    });
  } catch (error) {
    logger.error(error, error.message);
    await context.sendText(`Request failed: ${error.message}`);
  }
};
