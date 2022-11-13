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
        collectionItem[1].isMinting = true;
      }
    })
  );

const getPricesRange = (prices) => {
  const minPrice = Number.parseFloat(Math.min(...prices)).toFixed(3) * 1;
  const maxPrice = Number.parseFloat(Math.max(...prices)).toFixed(3) * 1;

  if (minPrice === maxPrice) {
    return `${minPrice}eth`;
  }

  return `${minPrice} - ${maxPrice}eth`;
};

const formatResponse = (filteredCollections) =>
  filteredCollections
    .map((result) => {
      const uniqueBuyers = [...new Set(result[1].buyers)].length;
      const price = getPricesRange(result[1].prices);
      return `<a href="https://gem.xyz/collection/${result[1].slug}">${
        result[0]
      }</a>: ${result[1].numberOfSales} sale${
        result[1].numberOfSales > 1 ? 's' : ''
      }${
        result[1].acceptedBids > 0
          ? ' (' +
            result[1].acceptedBids +
            ' accepted bid' +
            (result[1].acceptedBids > 1 ? 's' : '') +
            ')'
          : ''
      }\nunique buyers: ${uniqueBuyers}\n${
        result[1].isMinting ? 'MINTING\n' : ''
      }${
        result[1].isUnrevealed ? 'UNREVEALED\n' : ''
      }sold for ${price}\nfloor: ${result[1].floorPrice}eth\n${
        result[1].averagePrice
          ? 'one hour average price: ' + result[1].oneHourAveragePrice + 'eth\n'
          : ''
      }${
        result[1].averagePrice
          ? 'average price: ' + result[1].averagePrice + 'eth\n'
          : ''
      }${
        result[1].oneHourSales
          ? 'one hour sales: ' + result[1].oneHourSales + '\n'
          : ''
      }${
        result[1].totalSales
          ? 'total sales: ' + result[1].totalSales + '\n'
          : ''
      }total volume: ${result[1].totalVolume}eth\n${
        result[1].numberOfListed
          ? 'listed/supply: ' +
            result[1].numberOfListed +
            '/' +
            result[1].totalSupply +
            '\n'
          : ''
      }owners/supply: ${result[1].numberOfOwners}/${
        result[1].totalSupply
      }\nroyalty: ${result[1].royalty}%\ncreation date: ${
        result[1].createdDate
      }\n${
        result[1].twitterUsername
          ? `<a href="https://twitter.com/${result[1].twitterUsername}">twitter</a>\n`
          : ''
      }<a href="https://coniun.io/collection/${
        result[1].slug
      }/dashboard">dashboard</a>\n`;
    })
    .join('\n');

const addCollectionsInfo = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const collectionSlug = collectionItem[1].slug;
      const collectionData = await nftApi.getCollectionInfo(collectionSlug);
      const stats = collectionData.statsV2;
      collectionItem[1].contractAddress =
        collectionData.assetContracts?.edges?.[0]?.node?.address;
      collectionItem[1].createdDate = createDate(collectionData.createdDate);
      collectionItem[1].floorPrice =
        stats.floorPrice?.unit &&
        Number.parseFloat(stats.floorPrice.unit).toFixed(3) * 1;
      collectionItem[1].isUnrevealed = collectionData.stringTraits.length < 1;
      collectionItem[1].numberOfOwners = stats.numOwners;
      collectionItem[1].royalty =
        Number(collectionData.totalCreatorFeeBasisPoints) / 100;
      collectionItem[1].numberOfListed = stats.totalListed;
      collectionItem[1].totalSupply = stats.totalSupply;
      collectionItem[1].totalVolume =
        Number.parseFloat(stats.totalVolume.unit).toFixed(1) * 1;
      collectionItem[1].twitterUsername =
        collectionData.connectedTwitterUsername;
    })
  );

const addCollectionsStats = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const collectionSlug = collectionItem[1].slug;
      const collectionStats = await nftApi.getCollectionStats(collectionSlug);
      collectionItem[1].averagePrice =
        Number.parseFloat(collectionStats.average_price).toFixed(3) * 1;
      collectionItem[1].oneHourAveragePrice =
        collectionStats.one_hour_average_price &&
        Number.parseFloat(collectionStats.one_hour_average_price).toFixed(3) *
          1;
      collectionItem[1].oneHourSales = collectionStats.one_hour_sales;
      collectionItem[1].totalSales = collectionStats.total_sales;
    })
  );

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
      const tokenId = Number(node?.item?.tokenId);
      const isAcceptedBid = node?.payment?.symbol === WETH;
      const acceptedBids = isAcceptedBid ? 1 : 0;
      const buyer = node.winnerAccount.address;
      const price = node.perUnitPrice.eth;
      if (results[collectionName]) {
        results[collectionName].buyers.push(buyer);
        results[collectionName].numberOfSales += 1;
        results[collectionName].acceptedBids += acceptedBids;
        results[collectionName].prices.push(price);
        continue;
      }
      results[collectionName] = {
        slug: node?.collection?.slug,
        acceptedBids,
        buyers: [buyer],
        prices: [price],
        tokenId,
        numberOfSales: 1,
      };
    }
    requestNumber += 1;
    logger.info(`Got ${newItems} events, finished ${requestNumber}. request`);
  } while (cursor && newItems !== 0);

  return results;
};

const getFilteredCollections = (collections) =>
  collections.filter(
    ([, value]) =>
      value.totalSupply <= MAX_TOTAL_SUPPLY &&
      value.totalSupply >= MIN_TOTAL_SUPPLY &&
      value.totalVolume > MIN_VOLUME &&
      value.floorPrice >= MIN_FLOOR_PRICE &&
      value.numberOfOwners <= value.totalSupply
  );

const getTimezoneDate = (date) =>
  date.toLocaleTimeString('en-US', { timeZone: TIMEZONE });

const getMessageForEmptyList = (minutes, date) => {
  const message = `There are no bought NFTs in last ${minutes} minute${
    minutes > 1 ? 's' : ''
  } (after ${getTimezoneDate(date)})`;
  logger.info(message);
  return message;
};

const getResponse = (collections, minutes, date) => {
  const formattedResponse = formatResponse(collections);
  return `Bought NFTs in last ${minutes} minute${
    minutes > 1 ? 's' : ''
  } (after ${getTimezoneDate(date)})\n\n${formattedResponse}`;
};

const getSortedCollections = (collections) =>
  Object.entries(collections)
    .sort((a, b) => b[1].numberOfSales - a[1].numberOfSales)
    .slice(0, COLLECTIONS_TO_ANALYZE);

const handleMessage = async (time) => {
  try {
    const [seconds, minutes] = time;

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
  addCollectionsInfo,
  formatResponse,
  getCollections,
  getFilteredCollections,
  getMessageForEmptyList,
  getResponse,
  getSortedCollections,
  handleMessage,
};
