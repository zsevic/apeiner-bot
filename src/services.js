const {
  COLLECTIONS_TO_ANALYZE,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_TOTAL_SUPPLY,
  MIN_VOLUME,
  TIMEZONE,
  NULL_ADDRESS,
  WETH,
} = require('./constants');
const { logger } = require('./logger');
const nftApi = require('./nft-api');
const { getDate, createDate } = require('./utils');
/**
 * @private
 * @param {Array.<CollectionItem>} collections
 * @returns {Promise<void>}
 */
const addMintingInfo = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const events = await nftApi.getAssetEvents(collectionItem);
      if (!events?.length) return;
      const lastTransfer = events[events.length - 1];
      if (!lastTransfer) {
        return;
      }
      const address = lastTransfer?.node?.fromAccount?.address;
      const timestamp = new Date(lastTransfer?.node?.eventTimestamp + '.000Z');
      const date = new Date();
      const timeDifference = date.getTime() - timestamp.getTime();
      const timeFactor = 5 * 60 * 60 * 1000;
      if (address === NULL_ADDRESS && timeDifference < timeFactor) {
        collectionItem.isMinting = true;
      }
    })
  );
/**
 * @private
 * @param {Array.<number>} prices
 * @returns {string}
 */
const getPricesRange = (prices) => {
  const minPrice = Number.parseFloat(Math.min(...prices)).toFixed(3) * 1;
  const maxPrice = Number.parseFloat(Math.max(...prices)).toFixed(3) * 1;

  if (minPrice === maxPrice) {
    return `${minPrice}eth`;
  }

  return `${minPrice} - ${maxPrice}eth`;
};

/**
 * @typedef {object} CollectionItem
 * @property {string} [collectionName]
 * @property {Array.<number>} prices
 * @property {string} slug
 * @property {boolean} [isVerified]
 * @property {number} numberOfSales
 * @property {number} acceptedBids
 * @property {number} [uniqueBuyers]
 * @property {Array.<string>} [buyers]
 * @property {number} [uniqueSellers]
 * @property {Array.<string>} [sellers]
 * @property {boolean} [isMinting]
 * @property {boolean} isRevealed
 * @property {number} floorPrice
 * @property {number} averagePrice
 * @property {number} oneHourAveragePrice
 * @property {number} oneHourSales
 * @property {number} totalSales
 * @property {number} totalVolume
 * @property {number} numberOfListed
 * @property {number} totalSupply
 * @property {number} numberOfOwners
 * @property {number} royalty
 * @property {string} [twitterUsername]
 */

/**
 *
 * @param {Array.<CollectionItem>} filteredCollections
 * @returns {string}
 */
const formatResponse = (filteredCollections) =>
  filteredCollections
    .map((result) => {
      const price = getPricesRange(result.prices);
      return `${
        result.isVerified ? '&#x2713; ' : ''
      }<a href="https://gem.xyz/collection/${result.slug}">${
        result.collectionName
      }</a>: ${result.numberOfSales} sale${
        result.numberOfSales > 1 ? 's' : ''
      }${
        result.acceptedBids > 0
          ? ' (' +
            result.acceptedBids +
            ' accepted bid' +
            (result.acceptedBids > 1 ? 's' : '') +
            ')'
          : ''
      }\n${
        result.numberOfSales > 1
          ? 'unique buyers: ' +
            result.uniqueBuyers +
            '\n' +
            'unique sellers: ' +
            result.uniqueSellers +
            '\n'
          : ''
      }${result.isMinting ? 'MINTING\n' : ''}${
        result.isUnrevealed ? 'UNREVEALED\n' : ''
      }sold for ${price}\nfloor: ${result.floorPrice}eth\n${
        result.averagePrice && result.oneHourAveragePrice > 0
          ? 'one hour average price: ' + result.oneHourAveragePrice + 'eth\n'
          : ''
      }${
        result.averagePrice
          ? 'average price: ' + result.averagePrice + 'eth\n'
          : ''
      }${
        result.oneHourSales
          ? 'one hour sales: ' + result.oneHourSales + '\n'
          : ''
      }${
        result.totalSales ? 'total sales: ' + result.totalSales + '\n' : ''
      }total volume: ${result.totalVolume}eth\n${
        result.numberOfListed
          ? 'listed/supply: ' +
            result.numberOfListed +
            '/' +
            result.totalSupply +
            '\n'
          : ''
      }owners/supply: ${result.numberOfOwners}/${
        result.totalSupply
      }\nroyalty: ${result.royalty}%\ncreation date: ${result.createdDate}\n${
        result.twitterUsername
          ? `<a href="https://twitter.com/${result.twitterUsername}">twitter</a>\n`
          : ''
      }<a href="https://coniun.io/collection/${
        result.slug
      }/dashboard">dashboard</a>\n`;
    })
    .join('\n');
/**
 * @private
 * @param {Array.<CollectionItem>} collections
 * @returns {Promise<void>}
 */
const addCollectionsInfo = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const collectionSlug = collectionItem.slug;
      const collectionData = await nftApi.getCollectionInfo(collectionSlug);
      const stats = collectionData.statsV2;
      collectionItem.contractAddress =
        collectionData.assetContracts?.edges?.[0]?.node?.address;
      collectionItem.createdDate = createDate(collectionData.createdDate);
      collectionItem.floorPrice =
        stats.floorPrice?.unit &&
        Number.parseFloat(stats.floorPrice.unit).toFixed(3) * 1;
      collectionItem.isUnrevealed = collectionData.stringTraits.length < 1;
      collectionItem.numberOfOwners = stats.numOwners;
      collectionItem.royalty =
        Number(collectionData.totalCreatorFeeBasisPoints) / 100;
      collectionItem.numberOfListed = stats.totalListed;
      collectionItem.totalSupply = stats.totalSupply;
      collectionItem.totalVolume =
        Number.parseFloat(stats.totalVolume.unit).toFixed(1) * 1;
      collectionItem.twitterUsername = collectionData.connectedTwitterUsername;
      collectionItem.uniqueBuyers = [...new Set(collectionItem.buyers)].length;
      collectionItem.uniqueSellers = [
        ...new Set(collectionItem.sellers),
      ].length;
      collectionItem.buyers = undefined;
      collectionItem.sellers = undefined;
    })
  );
/**
 * @private
 * @param {Array.<CollectionItem>} collections
 * @returns {Promise<void>}
 */
const addCollectionsStats = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const collectionSlug = collectionItem.slug;
      const collectionStats = await nftApi.getCollectionStats(collectionSlug);
      collectionItem.averagePrice =
        Number.parseFloat(collectionStats.average_price).toFixed(3) * 1;
      collectionItem.oneHourAveragePrice =
        collectionStats.one_hour_average_price &&
        Number.parseFloat(collectionStats.one_hour_average_price).toFixed(3) *
          1;
      collectionItem.oneHourSales = collectionStats.one_hour_sales;
      collectionItem.totalSales = collectionStats.total_sales;
    })
  );
/**
 * @private
 * @param {Date} date
 * @returns {Promise<Object<string, CollectionItem>>}
 */
const getCollections = async (date) => {
  let cursor = null;
  let requestNumber = 0;
  let newItems = 0;

  const results = {};
  do {
    logger.info(`Sending ${requestNumber + 1}. request...`);
    const response = await nftApi.getEvents(cursor);
    cursor = response.pageInfo.endCursor;
    newItems = response.edges.length || 0;
    for (const event of response.edges) {
      const node = event?.node;
      if (
        new Date(node.eventTimestamp + '.000Z').getTime() <
        new Date(date).getTime()
      ) {
        cursor = null;
        break;
      }
      const collectionName = node?.collection?.name;
      if (!collectionName) continue;
      const isVerified =
        node?.item?.collection?.verificationStatus === 'VERIFIED';
      const tokenId = Number(node?.item?.tokenId);
      const isAcceptedBid = node?.payment?.symbol === WETH;
      const acceptedBids = isAcceptedBid ? 1 : 0;
      const buyer = node.winnerAccount.address;
      const seller = node.seller.address;
      const price = node.perUnitPrice.eth;
      if (results[collectionName]) {
        results[collectionName].buyers.push(buyer);
        results[collectionName].sellers.push(seller);
        results[collectionName].numberOfSales += 1;
        results[collectionName].acceptedBids += acceptedBids;
        results[collectionName].prices.push(price);
        continue;
      }
      results[collectionName] = {
        slug: node?.collection?.slug,
        acceptedBids,
        buyers: [buyer],
        sellers: [seller],
        prices: [price],
        isVerified,
        tokenId,
        numberOfSales: 1,
      };
    }
    requestNumber += 1;
    logger.info(`Got ${newItems} events, finished ${requestNumber}. request`);
  } while (cursor && newItems !== 0);

  return results;
};
/**
 *
 * @param {Array.<CollectionItem>} collections
 * @returns {Array.<CollectionItem>}
 */
const getFilteredCollections = (collections) =>
  collections.filter(
    (value) =>
      value.totalSupply <= MAX_TOTAL_SUPPLY &&
      value.totalSupply >= MIN_TOTAL_SUPPLY &&
      value.totalVolume > MIN_VOLUME &&
      value.floorPrice >= MIN_FLOOR_PRICE &&
      value.numberOfOwners <= value.totalSupply
  );
/**
 * @private
 * @param {Date} date
 * @returns {string}
 */
const getTimezoneDate = (date) =>
  date.toLocaleTimeString('en-US', { timeZone: TIMEZONE });
/**
 * @private
 * @param {number} minutes
 * @param {Date} date
 * @returns {string}
 */
const getMessageForEmptyList = (minutes, date) => {
  const message = `There are no bought NFTs in last ${minutes} minute${
    minutes > 1 ? 's' : ''
  } (after ${getTimezoneDate(date)})`;
  logger.info(message);
  return message;
};
/**
 * @private
 * @param {Array.<CollectionItem>} collections
 * @param {number} minutes
 * @param {Date} date
 * @returns {string}
 */
const getResponse = (collections, minutes, date) => {
  const formattedResponse = formatResponse(collections);
  return `Bought NFTs in last ${minutes} minute${
    minutes > 1 ? 's' : ''
  } (after ${getTimezoneDate(date)})\n\n${formattedResponse}`;
};
/**
 *
 * @param {Object.<string, CollectionItem>} collections
 * @returns {Array.<CollectionItem>}
 */
const getSortedCollections = (collections) =>
  Object.entries(collections)
    .map(([key, value]) =>
      Object.assign(value, {
        collectionName: key,
      })
    )
    .sort((a, b) => b.numberOfSales - a.numberOfSales)
    .slice(0, COLLECTIONS_TO_ANALYZE);

/**
 *
 * @param {number} seconds
 * @param {number} minutes
 * @returns {Promise<string>}
 */
const handleMessage = async (seconds, minutes) => {
  try {
    const date = getDate(seconds);
    const collections = await getCollections(date);

    const sortedCollections = getSortedCollections(collections);
    const sortedCollectionsLength = sortedCollections.length;
    if (sortedCollectionsLength === 0) {
      return getMessageForEmptyList(minutes, date);
    }
    logger.info(
      `Adding collections info for ${sortedCollectionsLength} collections...`
    );
    await addCollectionsInfo(sortedCollections);
    logger.info(
      `Added collections info for ${sortedCollectionsLength} collections...`
    );

    const filteredCollections = getFilteredCollections(sortedCollections);
    const filteredCollectionsLength = filteredCollections.length;
    if (filteredCollectionsLength === 0) {
      return getMessageForEmptyList(minutes, date);
    }

    try {
      logger.info(
        `Adding minting info for ${filteredCollectionsLength} collections...`
      );
      await addMintingInfo(filteredCollections);
      logger.info(
        `Added minting info for ${filteredCollectionsLength} collections...`
      );
    } catch (error) {
      logger.error(error, 'Adding minting info failed...');
    }

    try {
      logger.info(
        `Adding collections stats for ${filteredCollectionsLength} collections...`
      );
      await addCollectionsStats(filteredCollections);
      logger.info(
        `Added collections stats for ${filteredCollectionsLength} collections...`
      );
    } catch (error) {
      logger.error(error, 'Adding collections stats failed...');
    }

    logger.info(
      `Sending stats for last ${minutes} minute${minutes !== 1 ? 's' : ''}...`
    );
    return getResponse(filteredCollections, minutes, date);
  } catch (error) {
    logger.error(error, error.message);
    return `Request failed: ${error.message}`;
  }
};

module.exports = {
  formatResponse,
  getFilteredCollections,
  getSortedCollections,
  handleMessage,
};
