const axios = require('axios');
const { headers } = require('./constants');
const { logger } = require('./logger');
const {
  formatResponse,
  getCollections,
  getFilteredCollections,
  getSortedCollections,
  getMessageForEmptyList,
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
    await Promise.all(
      filteredCollections.map(async (collectionItem) => {
        const collectionSlug = collectionItem[1].slug;
        const body = `{"id":"AssetSearchCollectionQuery","query":"query AssetSearchCollectionQuery(\\n  $collection: CollectionSlug\\n  $collections: [CollectionSlug!]\\n  $count: Int\\n  $cursor: String\\n  $numericTraits: [TraitRangeType!]\\n  $paymentAssets: [PaymentAssetSymbol!]\\n  $priceFilter: PriceFilterType\\n  $query: String\\n  $resultModel: SearchResultModel\\n  $showContextMenu: Boolean = false\\n  $sortAscending: Boolean\\n  $sortBy: SearchSortBy\\n  $stringTraits: [TraitInputType!]\\n  $toggles: [SearchToggle!]\\n  $isAutoHidden: Boolean\\n  $safelistRequestStatuses: [SafelistRequestStatus!]\\n  $prioritizeBuyNow: Boolean = false\\n) {\\n  query {\\n    ...AssetSearchCollection_data_d9bxY\\n  }\\n}\\n\\nfragment AssetCardAnnotations_assetBundle on AssetBundleType {\\n  assetCount\\n}\\n\\nfragment AssetCardAnnotations_asset_27d9G3 on AssetType {\\n  assetContract {\\n    chain\\n    id\\n  }\\n  decimals\\n  relayId\\n  favoritesCount\\n  isDelisted\\n  isFrozen\\n  hasUnlockableContent\\n  ...AssetCardBuyNow_data\\n  orderData {\\n    bestAsk {\\n      orderType\\n      relayId\\n      maker {\\n        address\\n        id\\n      }\\n    }\\n  }\\n  ...AssetContextMenu_data_3z4lq0 @include(if: $showContextMenu)\\n}\\n\\nfragment AssetCardBuyNow_data on AssetType {\\n  tokenId\\n  relayId\\n  assetContract {\\n    address\\n    chain\\n    id\\n  }\\n  collection {\\n    slug\\n    id\\n  }\\n  orderData {\\n    bestAsk {\\n      relayId\\n      decimals\\n      paymentAssetQuantity {\\n        asset {\\n          usdSpotPrice\\n          decimals\\n          id\\n        }\\n        quantity\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment AssetCardContent_assetBundle on AssetBundleType {\\n  assetQuantities(first: 18) {\\n    edges {\\n      node {\\n        asset {\\n          relayId\\n          ...AssetMedia_asset\\n          id\\n        }\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment AssetCardContent_asset_2V84VL on AssetType {\\n  relayId\\n  name\\n  ...AssetMedia_asset_2V84VL\\n  assetContract {\\n    address\\n    chain\\n    openseaVersion\\n    id\\n  }\\n  tokenId\\n  collection {\\n    slug\\n    id\\n  }\\n  isDelisted\\n}\\n\\nfragment AssetCardFooter_assetBundle on AssetBundleType {\\n  ...AssetCardAnnotations_assetBundle\\n  name\\n  assetCount\\n  assetQuantities(first: 18) {\\n    edges {\\n      node {\\n        asset {\\n          collection {\\n            name\\n            relayId\\n            slug\\n            isVerified\\n            ...collection_url\\n            id\\n          }\\n          id\\n        }\\n        id\\n      }\\n    }\\n  }\\n  assetEventData {\\n    lastSale {\\n      unitPriceQuantity {\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n  }\\n  orderData {\\n    bestBid {\\n      orderType\\n      paymentAssetQuantity {\\n        quantity\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n    bestAsk {\\n      maker {\\n        address\\n        id\\n      }\\n      closedAt\\n      orderType\\n      dutchAuctionFinalPrice\\n      openedAt\\n      priceFnEndedAt\\n      quantity\\n      decimals\\n      paymentAssetQuantity {\\n        quantity\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment AssetCardFooter_asset_27d9G3 on AssetType {\\n  ...AssetCardAnnotations_asset_27d9G3\\n  name\\n  tokenId\\n  collection {\\n    slug\\n    name\\n    isVerified\\n    ...collection_url\\n    id\\n  }\\n  isDelisted\\n  assetContract {\\n    address\\n    chain\\n    openseaVersion\\n    id\\n  }\\n  assetEventData {\\n    lastSale {\\n      unitPriceQuantity {\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n  }\\n  orderData {\\n    bestBid {\\n      orderType\\n      paymentAssetQuantity {\\n        quantity\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n    bestAsk {\\n      maker {\\n        address\\n        id\\n      }\\n      closedAt\\n      orderType\\n      dutchAuctionFinalPrice\\n      openedAt\\n      priceFnEndedAt\\n      quantity\\n      decimals\\n      paymentAssetQuantity {\\n        quantity\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment AssetContextMenu_data_3z4lq0 on AssetType {\\n  ...asset_edit_url\\n  ...asset_url\\n  ...itemEvents_data\\n  relayId\\n  isDelisted\\n  creator {\\n    address\\n    id\\n  }\\n  imageUrl\\n}\\n\\nfragment AssetMedia_asset on AssetType {\\n  animationUrl\\n  backgroundColor\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n  decimals\\n  isDelisted\\n  imageUrl\\n  displayImageUrl\\n}\\n\\nfragment AssetMedia_asset_2V84VL on AssetType {\\n  animationUrl\\n  backgroundColor\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n  decimals\\n  isDelisted\\n  imageUrl\\n  displayImageUrl\\n}\\n\\nfragment AssetQuantity_data on AssetQuantityType {\\n  asset {\\n    ...Price_data\\n    id\\n  }\\n  quantity\\n}\\n\\nfragment AssetSearchCollection_data_d9bxY on Query {\\n  ...AssetSearchFilter_data_3KTzFc\\n  ...SearchPills_data_2Kg4Sq\\n  search: collectionAssets(after: $cursor, collections: $collections, first: $count, isAutoHidden: $isAutoHidden, numericTraits: $numericTraits, paymentAssets: $paymentAssets, resultType: $resultModel, priceFilter: $priceFilter, querystring: $query, safelistRequestStatuses: $safelistRequestStatuses, sortAscending: $sortAscending, sortBy: $sortBy, stringTraits: $stringTraits, toggles: $toggles, prioritizeBuyNow: $prioritizeBuyNow) {\\n    edges {\\n      node {\\n        asset {\\n          relayId\\n          id\\n        }\\n        ...AssetSearchList_data_27d9G3\\n        __typename\\n      }\\n      cursor\\n    }\\n    totalCount\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n    }\\n  }\\n}\\n\\nfragment AssetSearchFilter_data_3KTzFc on Query {\\n  collection(collection: $collection) {\\n    numericTraits {\\n      key\\n      value {\\n        max\\n        min\\n      }\\n      ...NumericTraitFilter_data\\n    }\\n    stringTraits {\\n      key\\n      ...StringTraitFilter_data\\n    }\\n    defaultChain {\\n      identifier\\n    }\\n    id\\n  }\\n  ...PaymentFilter_data_2YoIWt\\n}\\n\\nfragment AssetSearchList_data_27d9G3 on SearchResultType {\\n  asset {\\n    assetContract {\\n      address\\n      chain\\n      id\\n    }\\n    collection {\\n      isVerified\\n      relayId\\n      id\\n    }\\n    relayId\\n    tokenId\\n    ...AssetSelectionItem_data\\n    ...asset_url\\n    id\\n  }\\n  assetBundle {\\n    relayId\\n    id\\n  }\\n  ...Asset_data_1OrK6u\\n}\\n\\nfragment AssetSelectionItem_data on AssetType {\\n  backgroundColor\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    imageUrl\\n    id\\n  }\\n  imageUrl\\n  name\\n  relayId\\n}\\n\\nfragment Asset_data_1OrK6u on SearchResultType {\\n  asset {\\n    relayId\\n    isDelisted\\n    ...AssetCardContent_asset_2V84VL\\n    ...AssetCardFooter_asset_27d9G3\\n    ...asset_url\\n    ...itemEvents_data\\n    orderData {\\n      bestAsk {\\n        paymentAssetQuantity {\\n          quantityInEth\\n          id\\n        }\\n      }\\n    }\\n    id\\n  }\\n  assetBundle {\\n    relayId\\n    ...bundle_url\\n    ...AssetCardContent_assetBundle\\n    ...AssetCardFooter_assetBundle\\n    orderData {\\n      bestAsk {\\n        paymentAssetQuantity {\\n          quantityInEth\\n          id\\n        }\\n      }\\n    }\\n    id\\n  }\\n}\\n\\nfragment CollectionModalContent_data on CollectionType {\\n  description\\n  imageUrl\\n  name\\n  slug\\n}\\n\\nfragment NumericTraitFilter_data on NumericTraitTypePair {\\n  key\\n  value {\\n    max\\n    min\\n  }\\n}\\n\\nfragment PaymentFilter_data_2YoIWt on Query {\\n  paymentAssets(first: 10) {\\n    edges {\\n      node {\\n        symbol\\n        relayId\\n        id\\n        __typename\\n      }\\n      cursor\\n    }\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n    }\\n  }\\n  PaymentFilter_collection: collection(collection: $collection) {\\n    paymentAssets {\\n      symbol\\n      relayId\\n      id\\n    }\\n    id\\n  }\\n}\\n\\nfragment Price_data on AssetType {\\n  decimals\\n  imageUrl\\n  symbol\\n  usdSpotPrice\\n  assetContract {\\n    blockExplorerLink\\n    chain\\n    id\\n  }\\n}\\n\\nfragment SearchPills_data_2Kg4Sq on Query {\\n  selectedCollections: collections(first: 25, collections: $collections, includeHidden: true) {\\n    edges {\\n      node {\\n        imageUrl\\n        name\\n        slug\\n        ...CollectionModalContent_data\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment StringTraitFilter_data on StringTraitType {\\n  counts {\\n    count\\n    value\\n  }\\n  key\\n}\\n\\nfragment asset_edit_url on AssetType {\\n  assetContract {\\n    address\\n    chain\\n    id\\n  }\\n  tokenId\\n  collection {\\n    slug\\n    id\\n  }\\n}\\n\\nfragment asset_url on AssetType {\\n  assetContract {\\n    address\\n    chain\\n    id\\n  }\\n  tokenId\\n}\\n\\nfragment bundle_url on AssetBundleType {\\n  slug\\n}\\n\\nfragment collection_url on CollectionType {\\n  slug\\n  isCategory\\n}\\n\\nfragment itemEvents_data on AssetType {\\n  assetContract {\\n    address\\n    chain\\n    id\\n  }\\n  tokenId\\n}\\n","variables":{"categories":null,"chains":null,"collection":"${collectionSlug}","collectionQuery":null,"collectionSortBy":null,"collections":["${collectionSlug}"],"count":20,"cursor":null,"includeHiddenCollections":null,"numericTraits":null,"paymentAssets":null,"priceFilter":null,"query":"","resultModel":"ASSETS","showContextMenu":true,"sortAscending":true,"sortBy":"PRICE","stringTraits":null,"toggles":["BUY_NOW"],"creator":null,"assetOwner":null,"isPrivate":null,"isAutoHidden":null,"safelistRequestStatuses":null,"prioritizeBuyNow":true}}`;
        const collectionListingsInfo = await axios
          .post('https://api.opensea.io/graphql/', JSON.parse(body), {
            headers: {
              ...headers,
              accept: '*/*',
              'x-signed-query': process.env.OPENSEA_SIGNED_QUERY,
              'Referrer-Policy': 'strict-origin',
            },
          })
          .then((res) => {
            return res.data?.data?.query?.search?.totalCount;
          })
          .catch((error) => {
            console.error(
              'Fetching number of listed failed:',
              error.response?.data || error
            );
            return null;
          });
        if (collectionListingsInfo) {
          collectionItem[1].numberOfListed = collectionListingsInfo;
        }
      })
    );
    logger.info('Got listings info...');

    const response = formatResponse(filteredCollections);
    await context.sendMessage(
      `Bought NFTs in last ${minutes} minute${
        minutes > 1 ? 's' : ''
      } (after ${date.toLocaleTimeString()})\n${response}`,
      {
        parseMode: 'HTML',
      }
    );
  } catch (error) {
    logger.error(error, error.message);
    await context.sendText(`Request failed: ${error.message}`);
  }
};
