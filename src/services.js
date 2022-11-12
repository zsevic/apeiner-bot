const axios = require('axios');
const {
  headers,
  COLLECTIONS_TO_ANALYZE,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_TOTAL_SUPPLY,
  MIN_VOLUME,
  OPENSEA_API_BASE_URL,
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
      const body = `{\"id\":\"EventHistoryQuery\",\"query\":\"query EventHistoryQuery(\\n  $archetype: ArchetypeInputType\\n  $bundle: BundleSlug\\n  $collections: [CollectionSlug!]\\n  $categories: [CollectionSlug!]\\n  $chains: [ChainScalar!]\\n  $eventTypes: [EventType!]\\n  $cursor: String\\n  $count: Int = 16\\n  $showAll: Boolean = false\\n  $identity: IdentityInputType\\n) {\\n  ...EventHistory_data_L1XK6\\n}\\n\\nfragment AccountLink_data on AccountType {\\n  address\\n  config\\n  isCompromised\\n  user {\\n    publicUsername\\n    id\\n  }\\n  displayName\\n  ...ProfileImage_data\\n  ...wallet_accountKey\\n  ...accounts_url\\n}\\n\\nfragment AssetMediaAnimation_asset on AssetType {\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaAudio_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\\n  backgroundColor\\n  ...AssetMediaEditions_asset_2V84VL\\n}\\n\\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\\n  decimals\\n}\\n\\nfragment AssetMediaImage_asset on AssetType {\\n  backgroundColor\\n  imageUrl\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n}\\n\\nfragment AssetMediaPlaceholderImage_asset on AssetType {\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n}\\n\\nfragment AssetMediaVideo_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaWebgl_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMedia_asset on AssetType {\\n  animationUrl\\n  displayImageUrl\\n  imageUrl\\n  isDelisted\\n  ...AssetMediaAnimation_asset\\n  ...AssetMediaAudio_asset\\n  ...AssetMediaContainer_asset_2V84VL\\n  ...AssetMediaImage_asset\\n  ...AssetMediaPlaceholderImage_asset\\n  ...AssetMediaVideo_asset\\n  ...AssetMediaWebgl_asset\\n}\\n\\nfragment CollectionCell_collection on CollectionType {\\n  name\\n  imageUrl\\n  isVerified\\n  ...collection_url\\n}\\n\\nfragment CollectionCell_trait on TraitType {\\n  traitType\\n  value\\n}\\n\\nfragment CollectionLink_assetContract on AssetContractType {\\n  address\\n  blockExplorerLink\\n}\\n\\nfragment CollectionLink_collection on CollectionType {\\n  name\\n  verificationStatus\\n  ...collection_url\\n}\\n\\nfragment EventHistory_data_L1XK6 on Query {\\n  assetEvents(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true) {\\n    edges {\\n      node {\\n        collection {\\n          ...CollectionCell_collection\\n          id\\n        }\\n        traitCriteria {\\n          ...CollectionCell_trait\\n          id\\n        }\\n        itemQuantity\\n        item @include(if: $showAll) {\\n          __typename\\n          relayId\\n          verificationStatus\\n          ...ItemCell_data\\n          ...item_url\\n          ... on AssetType {\\n            collection {\\n              ...CollectionLink_collection\\n              id\\n            }\\n            assetContract {\\n              ...CollectionLink_assetContract\\n              id\\n            }\\n          }\\n          ... on AssetBundleType {\\n            bundleCollection: collection {\\n              ...CollectionLink_collection\\n              id\\n            }\\n          }\\n          ... on Node {\\n            __isNode: __typename\\n            id\\n          }\\n        }\\n        relayId\\n        eventTimestamp\\n        eventType\\n        orderExpired\\n        customEventName\\n        ...utilsAssetEventLabel\\n        creatorFee {\\n          unit\\n        }\\n        devFeePaymentEvent {\\n          ...EventTimestamp_data\\n          id\\n        }\\n        fromAccount {\\n          address\\n          ...AccountLink_data\\n          id\\n        }\\n        perUnitPrice {\\n          unit\\n          eth\\n          usd\\n        }\\n        endingPriceType {\\n          unit\\n        }\\n        priceType {\\n          unit\\n        }\\n        payment {\\n          ...TokenPricePayment\\n          id\\n        }\\n        seller {\\n          ...AccountLink_data\\n          id\\n        }\\n        toAccount {\\n          ...AccountLink_data\\n          id\\n        }\\n        winnerAccount {\\n          ...AccountLink_data\\n          id\\n        }\\n        ...EventTimestamp_data\\n        id\\n        __typename\\n      }\\n      cursor\\n    }\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n    }\\n  }\\n}\\n\\nfragment EventTimestamp_data on AssetEventType {\\n  eventTimestamp\\n  transaction {\\n    blockExplorerLink\\n    id\\n  }\\n}\\n\\nfragment ItemCell_data on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  name\\n  ...item_url\\n  ... on AssetType {\\n    collection {\\n      name\\n      id\\n    }\\n    ...AssetMedia_asset\\n  }\\n  ... on AssetBundleType {\\n    bundleCollection: collection {\\n      name\\n      id\\n    }\\n    assetQuantities(first: 30) {\\n      edges {\\n        node {\\n          asset {\\n            name\\n            ...AssetMedia_asset\\n            id\\n          }\\n          relayId\\n          id\\n        }\\n      }\\n    }\\n  }\\n}\\n\\nfragment ProfileImage_data on AccountType {\\n  imageUrl\\n}\\n\\nfragment TokenPricePayment on PaymentAssetType {\\n  symbol\\n  chain {\\n    identifier\\n  }\\n  asset {\\n    imageUrl\\n    assetContract {\\n      blockExplorerLink\\n      id\\n    }\\n    id\\n  }\\n}\\n\\nfragment accounts_url on AccountType {\\n  address\\n  user {\\n    publicUsername\\n    id\\n  }\\n}\\n\\nfragment asset_url on AssetType {\\n  assetContract {\\n    address\\n    id\\n  }\\n  tokenId\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment bundle_url on AssetBundleType {\\n  slug\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment collection_url on CollectionType {\\n  slug\\n  isCategory\\n}\\n\\nfragment item_url on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  ... on AssetType {\\n    ...asset_url\\n  }\\n  ... on AssetBundleType {\\n    ...bundle_url\\n  }\\n}\\n\\nfragment utilsAssetEventLabel on AssetEventType {\\n  isMint\\n  isAirdrop\\n  eventType\\n}\\n\\nfragment wallet_accountKey on AccountType {\\n  address\\n}\\n\",\"variables\":{\"archetype\":{\"chain\":\"ETHEREUM\",\"tokenId\":\"${collectionItem[1].tokenId}\",\"assetContractAddress\":\"${collectionItem[1].contractAddress}\"},\"bundle\":null,\"collections\":null,\"categories\":null,\"chains\":null,\"eventTypes\":[\"AUCTION_SUCCESSFUL\",\"ASSET_TRANSFER\"],\"cursor\":null,\"count\":16,\"showAll\":true,\"identity\":null}}`;
      const events = await fetch(OPENSEA_API_BASE_URL, {
        method: 'POST',
        body,
        headers: {
          ...headers,
          'x-signed-query':
            '271a4f18899705c51c47b85daee8848ef9b0eb59610db733d09b10d8e58f9256',
        },
      })
        .then(res => res.json())
        .then(res => res.data?.assetEvents?.edges);
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
      collectionItem[1].isUnrevealed = collectionData.stringTraits.length <= 1;
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
      const collectionStats = await axios(
        `https://api.opensea.io/api/v1/collection/${collectionSlug}`
      ).then((res) => res.data.collection.stats);
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
  } while (cursor && newItems !== 0 && requestNumber <= 10);

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
    logger.info(`Adding collections info for ${sortedCollectionsLength} collections...`);
    await addCollectionsInfo(sortedCollections);
    logger.info(`Added collections info for ${sortedCollectionsLength} collections...`);

    const filteredCollections = getFilteredCollections(sortedCollections);
    const filteredCollectionsLength = filteredCollections.length;
    if (filteredCollectionsLength === 0) {
      return getMessageForEmptyList(minutes, date);
    }

    try {
      logger.info(`Adding minting info for ${filteredCollectionsLength} collections...`);
      await addMintingInfo(filteredCollections);
      logger.info(`Added minting info for ${filteredCollectionsLength} collections...`);
    } catch (error) {
      logger.error(error, 'Adding minting info failed...');
    }

    try {
      logger.info(`Adding collections stats for ${filteredCollectionsLength} collections...`);
      await addCollectionsStats(filteredCollections);
      logger.info(`Added collections stats for ${filteredCollectionsLength} collections...`);
    } catch (error) {
      logger.error(error, 'Adding collections stats failed...');
    }

    logger.info(`Sending stats for last ${minutes} minute${
      minutes !== 1 ? 's' : ''
    }...`);
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
