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
const { isEmptyObject, getDate } = require('./utils');

const addMintingInfo = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const queryParams = {
        event_type: 'transfer',
        token_id: collectionItem[1].tokenId,
        asset_contract_address: collectionItem[1].contractAddress,
        collection_slug: collectionItem[1].slug,
      };
      const events = await axios('https://api.opensea.io/api/v1/events', {
        params: queryParams,
        headers,
      }).then((res) => res.data.asset_events);
      const lastTransfer = events[events.length - 1];
      if (!lastTransfer) {
        return;
      }
      const address = lastTransfer?.from_account?.address;
      const timestamp = new Date(lastTransfer.created_date);
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
      return `<a href="https://opensea.io/collection/${result[1].slug}">${
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
        result[1].oneDayVolume
          ? 'one day volume: ' + result[1].oneDayVolume + 'eth\n'
          : ''
      }total volume: ${result[1].totalVolume}eth\n${
        result[1].numberOfListed
          ? 'listed/supply: ' +
            result[1].numberOfListed +
            '/' +
            result[1].totalSupply +
            '\n'
          : ''
      }${
        result[1].oneDaySales
          ? 'one day sales: ' + result[1].oneDaySales + '\n'
          : ''
      }owners/supply: ${result[1].numberOfOwners}/${
        result[1].totalSupply
      }\nroyalty: ${result[1].royalty}%\n`;
    })
    .join('\n');

const addCollectionsInfo = async (collections) =>
  Promise.all(
    collections.map(async (collectionItem) => {
      const collectionSlug = collectionItem[1].slug;
      const body = `{\"id\":\"CollectionPageQuery\",\"query\":\"query CollectionPageQuery(\\n  $collection: CollectionSlug!\\n  $collections: [CollectionSlug!]\\n  $numericTraits: [TraitRangeType!]\\n  $query: String\\n  $sortAscending: Boolean\\n  $sortBy: SearchSortBy\\n  $stringTraits: [TraitInputType!]\\n  $toggles: [SearchToggle!]\\n  $resultModel: SearchResultModel\\n  $showContextMenu: Boolean!\\n  $prioritizeBuyNow: Boolean\\n) {\\n  collection(collection: $collection) {\\n    isCollectionOffersEnabled\\n    verificationStatus\\n    enabledRarities\\n    ...CollectionPageHead_collection\\n    ...CollectionPageLayout_collection\\n    id\\n  }\\n  ...AssetSearchCollectionView_data_2ZxBTm\\n}\\n\\nfragment AccountLink_data on AccountType {\\n  address\\n  config\\n  isCompromised\\n  user {\\n    publicUsername\\n    id\\n  }\\n  displayName\\n  ...ProfileImage_data\\n  ...wallet_accountKey\\n  ...accounts_url\\n}\\n\\nfragment AssetAddToCartButton_order on OrderV2Type {\\n  maker {\\n    address\\n    id\\n  }\\n  item {\\n    __typename\\n    ...itemEvents_data\\n    ... on Node {\\n      __isNode: __typename\\n      id\\n    }\\n  }\\n  ...ShoppingCartContextProvider_inline_order\\n}\\n\\nfragment AssetCardBuyNow_data on AssetType {\\n  tokenId\\n  relayId\\n  assetContract {\\n    address\\n    chain\\n    id\\n  }\\n  orderData {\\n    bestAskV2 {\\n      relayId\\n      priceType {\\n        usd\\n      }\\n      id\\n    }\\n  }\\n}\\n\\nfragment AssetContextMenu_data on AssetType {\\n  ...asset_edit_url\\n  ...asset_url\\n  relayId\\n  isDelisted\\n  creator {\\n    address\\n    id\\n  }\\n  imageUrl\\n}\\n\\nfragment AssetMediaAnimation_asset on AssetType {\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaAudio_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\\n  backgroundColor\\n  ...AssetMediaEditions_asset_2V84VL\\n}\\n\\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\\n  decimals\\n}\\n\\nfragment AssetMediaImage_asset on AssetType {\\n  backgroundColor\\n  imageUrl\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n}\\n\\nfragment AssetMediaPlaceholderImage_asset on AssetType {\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n}\\n\\nfragment AssetMediaVideo_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaWebgl_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMedia_asset on AssetType {\\n  animationUrl\\n  displayImageUrl\\n  imageUrl\\n  isDelisted\\n  ...AssetMediaAnimation_asset\\n  ...AssetMediaAudio_asset\\n  ...AssetMediaContainer_asset_2V84VL\\n  ...AssetMediaImage_asset\\n  ...AssetMediaPlaceholderImage_asset\\n  ...AssetMediaVideo_asset\\n  ...AssetMediaWebgl_asset\\n}\\n\\nfragment AssetMedia_asset_2V84VL on AssetType {\\n  animationUrl\\n  displayImageUrl\\n  imageUrl\\n  isDelisted\\n  ...AssetMediaAnimation_asset\\n  ...AssetMediaAudio_asset\\n  ...AssetMediaContainer_asset_2V84VL\\n  ...AssetMediaImage_asset\\n  ...AssetMediaPlaceholderImage_asset\\n  ...AssetMediaVideo_asset\\n  ...AssetMediaWebgl_asset\\n}\\n\\nfragment AssetQuantity_data on AssetQuantityType {\\n  asset {\\n    ...Price_data\\n    id\\n  }\\n  quantity\\n}\\n\\nfragment AssetSearchCollectionView_data_2ZxBTm on Query {\\n  ...AssetSearchSortDropdown_data\\n  ...AssetSearchCollection_data_2ZxBTm\\n}\\n\\nfragment AssetSearchCollection_data_2ZxBTm on Query {\\n  queriedAt\\n  ...AssetSearchFilter_data_PFx8Z\\n  ...PhoenixSearchPills_data_2Kg4Sq\\n  search: collectionItems(collections: $collections, first: 20, numericTraits: $numericTraits, resultType: $resultModel, querystring: $query, sortAscending: $sortAscending, sortBy: $sortBy, stringTraits: $stringTraits, toggles: $toggles, prioritizeBuyNow: $prioritizeBuyNow) {\\n    edges {\\n      node {\\n        __typename\\n        relayId\\n        ...AssetSearchList_data_27d9G3\\n        ... on Node {\\n          __isNode: __typename\\n          id\\n        }\\n      }\\n      cursor\\n    }\\n    totalCount\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n    }\\n  }\\n}\\n\\nfragment AssetSearchFilter_data_PFx8Z on Query {\\n  collection(collection: $collection) {\\n    numericTraits {\\n      key\\n      value {\\n        max\\n        min\\n      }\\n      ...NumericTraitFilter_data\\n    }\\n    stringTraits {\\n      key\\n      ...StringTraitFilter_data\\n    }\\n    defaultChain {\\n      identifier\\n    }\\n    enabledRarities\\n    statsV2 {\\n      ...RarityFilter_data\\n    }\\n    ...useIsRarityEnabled_collection\\n    id\\n  }\\n  ...PaymentFilter_data_2YoIWt\\n}\\n\\nfragment AssetSearchList_data_27d9G3 on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  relayId\\n  ...ItemCard_data_1OrK6u\\n  ... on AssetType {\\n    collection {\\n      isVerified\\n      relayId\\n      id\\n    }\\n    ...SelectedAssetItem_data\\n    ...asset_url\\n  }\\n  ... on AssetBundleType {\\n    bundleCollection: collection {\\n      isVerified\\n      relayId\\n      id\\n    }\\n  }\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment AssetSearchSortDropdown_data on Query {\\n  collection(collection: $collection) {\\n    ...useIsRarityEnabled_collection\\n    id\\n  }\\n}\\n\\nfragment CollectionDescriptionMetadata_data on CollectionType {\\n  statsV2 {\\n    totalSupply\\n  }\\n  createdDate\\n  totalCreatorFeeBasisPoints\\n  defaultChain {\\n    identifier\\n  }\\n}\\n\\nfragment CollectionLink_assetContract on AssetContractType {\\n  address\\n  blockExplorerLink\\n}\\n\\nfragment CollectionLink_collection on CollectionType {\\n  name\\n  verificationStatus\\n  ...collection_url\\n}\\n\\nfragment CollectionPageHead_collection on CollectionType {\\n  name\\n  description\\n  slug\\n}\\n\\nfragment CollectionPageLayout_collection on CollectionType {\\n  slug\\n  name\\n  imageUrl\\n  bannerImageUrl\\n  verificationStatus\\n  owner {\\n    ...AccountLink_data\\n    id\\n  }\\n  representativeAsset {\\n    assetContract {\\n      openseaVersion\\n      id\\n    }\\n    id\\n  }\\n  ...PhoenixCollectionActionBar_data\\n  ...PhoenixCollectionInfo_data\\n  ...PhoenixCollectionSocialBar_data\\n}\\n\\nfragment CollectionWatchlistButton_data on CollectionType {\\n  relayId\\n}\\n\\nfragment ItemCardAnnotations_27d9G3 on ItemType {\\n  __isItemType: __typename\\n  relayId\\n  __typename\\n  ... on AssetType {\\n    chain {\\n      identifier\\n    }\\n    decimals\\n    favoritesCount\\n    isDelisted\\n    isFrozen\\n    hasUnlockableContent\\n    ...AssetCardBuyNow_data\\n    orderData {\\n      bestAskV2 {\\n        ...AssetAddToCartButton_order\\n        orderType\\n        maker {\\n          address\\n          id\\n        }\\n        id\\n      }\\n    }\\n    ...AssetContextMenu_data @include(if: $showContextMenu)\\n  }\\n  ... on AssetBundleType {\\n    assetCount\\n  }\\n}\\n\\nfragment ItemCardContent_2V84VL on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  ... on AssetType {\\n    relayId\\n    name\\n    ...AssetMedia_asset_2V84VL\\n  }\\n  ... on AssetBundleType {\\n    assetQuantities(first: 18) {\\n      edges {\\n        node {\\n          asset {\\n            relayId\\n            ...AssetMedia_asset\\n            id\\n          }\\n          id\\n        }\\n      }\\n    }\\n  }\\n}\\n\\nfragment ItemCardFooter_27d9G3 on ItemType {\\n  __isItemType: __typename\\n  name\\n  orderData {\\n    bestBidV2 {\\n      orderType\\n      priceType {\\n        unit\\n      }\\n      ...PriceContainer_data\\n      id\\n    }\\n    bestAskV2 {\\n      orderType\\n      priceType {\\n        unit\\n      }\\n      maker {\\n        address\\n        id\\n      }\\n      ...PriceContainer_data\\n      id\\n    }\\n  }\\n  ...ItemMetadata\\n  ...ItemCardAnnotations_27d9G3\\n  ... on AssetType {\\n    tokenId\\n    isDelisted\\n    defaultRarityData {\\n      ...RarityIndicator_data\\n      id\\n    }\\n    collection {\\n      slug\\n      name\\n      isVerified\\n      ...collection_url\\n      ...useIsRarityEnabled_collection\\n      id\\n    }\\n  }\\n  ... on AssetBundleType {\\n    bundleCollection: collection {\\n      slug\\n      name\\n      isVerified\\n      ...collection_url\\n      ...useIsRarityEnabled_collection\\n      id\\n    }\\n  }\\n}\\n\\nfragment ItemCard_data_1OrK6u on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  relayId\\n  orderData {\\n    bestAskV2 {\\n      priceType {\\n        eth\\n      }\\n      id\\n    }\\n  }\\n  ...ItemCardContent_2V84VL\\n  ...ItemCardFooter_27d9G3\\n  ...item_url\\n  ... on AssetType {\\n    isDelisted\\n    ...itemEvents_data\\n  }\\n}\\n\\nfragment ItemMetadata on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  orderData {\\n    bestAskV2 {\\n      closedAt\\n      id\\n    }\\n  }\\n  assetEventData {\\n    lastSale {\\n      unitPriceQuantity {\\n        ...AssetQuantity_data\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment NumericTraitFilter_data on NumericTraitTypePair {\\n  key\\n  value {\\n    max\\n    min\\n  }\\n}\\n\\nfragment OrderListItem_order on OrderV2Type {\\n  relayId\\n  item {\\n    __typename\\n    ... on AssetType {\\n      __typename\\n      name\\n      assetContract {\\n        ...CollectionLink_assetContract\\n        id\\n      }\\n      collection {\\n        ...CollectionLink_collection\\n        ...useCollectionFees_collection\\n        id\\n      }\\n      ...AssetMedia_asset\\n      ...asset_url\\n    }\\n    ... on AssetBundleType {\\n      __typename\\n    }\\n    ...itemEvents_data\\n    ... on Node {\\n      __isNode: __typename\\n      id\\n    }\\n  }\\n  remainingQuantityType\\n  ...OrderPrice\\n  ...OrderUsdPrice\\n}\\n\\nfragment OrderList_orders on OrderV2Type {\\n  relayId\\n  ...OrderListItem_order\\n}\\n\\nfragment OrderPrice on OrderV2Type {\\n  priceType {\\n    unit\\n  }\\n  perUnitPriceType {\\n    unit\\n  }\\n  dutchAuctionFinalPriceType {\\n    unit\\n  }\\n  openedAt\\n  closedAt\\n  payment {\\n    ...TokenPricePayment\\n    id\\n  }\\n}\\n\\nfragment OrderUsdPrice on OrderV2Type {\\n  priceType {\\n    usd\\n  }\\n  perUnitPriceType {\\n    usd\\n  }\\n  dutchAuctionFinalPriceType {\\n    usd\\n  }\\n  openedAt\\n  closedAt\\n}\\n\\nfragment PaymentAssetLogo_data on PaymentAssetType {\\n  chain {\\n    identifier\\n  }\\n  symbol\\n  asset {\\n    imageUrl\\n    id\\n  }\\n}\\n\\nfragment PaymentFilter_data_2YoIWt on Query {\\n  paymentAssets(first: 10) {\\n    edges {\\n      node {\\n        symbol\\n        id\\n        __typename\\n      }\\n      cursor\\n    }\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n    }\\n  }\\n  PaymentFilter_collection: collection(collection: $collection) {\\n    paymentAssets {\\n      symbol\\n      id\\n    }\\n    id\\n  }\\n}\\n\\nfragment PhoenixCollectionActionBar_data on CollectionType {\\n  relayId\\n  assetContracts(first: 2) {\\n    edges {\\n      node {\\n        address\\n        blockExplorerLink\\n        chain\\n        chainData {\\n          blockExplorer {\\n            name\\n            identifier\\n          }\\n        }\\n        id\\n      }\\n    }\\n  }\\n  discordUrl\\n  externalUrl\\n  instagramUsername\\n  mediumUsername\\n  telegramUrl\\n  twitterUsername\\n  connectedTwitterUsername\\n  ...collection_url\\n  ...CollectionWatchlistButton_data\\n}\\n\\nfragment PhoenixCollectionInfo_data on CollectionType {\\n  isCollectionOffersEnabled\\n  description\\n  name\\n  nativePaymentAsset {\\n    ...PaymentAssetLogo_data\\n    id\\n  }\\n  ...collection_url\\n  ...collection_stats\\n  ...CollectionDescriptionMetadata_data\\n}\\n\\nfragment PhoenixCollectionSocialBar_data on CollectionType {\\n  assetContracts(first: 2) {\\n    edges {\\n      node {\\n        address\\n        blockExplorerLink\\n        chain\\n        chainData {\\n          blockExplorer {\\n            name\\n            identifier\\n          }\\n        }\\n        id\\n      }\\n    }\\n  }\\n  discordUrl\\n  externalUrl\\n  instagramUsername\\n  mediumUsername\\n  telegramUrl\\n  twitterUsername\\n  connectedTwitterUsername\\n  connectedInstagramUsername\\n  ...collection_url\\n}\\n\\nfragment PhoenixSearchPills_data_2Kg4Sq on Query {\\n  selectedCollections: collections(first: 25, collections: $collections, includeHidden: true) {\\n    edges {\\n      node {\\n        imageUrl\\n        name\\n        slug\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment PriceContainer_data on OrderV2Type {\\n  ...OrderPrice\\n}\\n\\nfragment Price_data on AssetType {\\n  decimals\\n  imageUrl\\n  symbol\\n  usdSpotPrice\\n  assetContract {\\n    blockExplorerLink\\n    chain\\n    id\\n  }\\n}\\n\\nfragment ProfileImage_data on AccountType {\\n  imageUrl\\n}\\n\\nfragment RarityFilter_data on CollectionStatsV2Type {\\n  totalSupply\\n}\\n\\nfragment RarityIndicator_data on RarityDataType {\\n  rank\\n  rankPercentile\\n  totalSupply\\n  rankCount\\n}\\n\\nfragment SelectedAssetItem_data on AssetType {\\n  collection {\\n    imageUrl\\n    name\\n    verificationStatus\\n    id\\n  }\\n  imageUrl\\n  displayName\\n  relayId\\n  ...asset_url\\n}\\n\\nfragment ShoppingCartContextProvider_inline_order on OrderV2Type {\\n  relayId\\n  item {\\n    __typename\\n    chain {\\n      identifier\\n    }\\n    ... on Node {\\n      __isNode: __typename\\n      id\\n    }\\n  }\\n  payment {\\n    relayId\\n    id\\n  }\\n  remainingQuantityType\\n  ...ShoppingCart_orders\\n}\\n\\nfragment ShoppingCartDetailedView_orders on OrderV2Type {\\n  relayId\\n  item {\\n    __typename\\n    ... on AssetType {\\n      collection {\\n        verificationStatus\\n        id\\n      }\\n    }\\n    chain {\\n      identifier\\n    }\\n    ... on Node {\\n      __isNode: __typename\\n      id\\n    }\\n  }\\n  supportsGiftingOnPurchase\\n  ...useTotalPrice_orders\\n  ...OrderList_orders\\n}\\n\\nfragment ShoppingCartFooter_orders on OrderV2Type {\\n  item {\\n    __typename\\n    chain {\\n      identifier\\n    }\\n    ... on Node {\\n      __isNode: __typename\\n      id\\n    }\\n  }\\n  ...useTotalPrice_orders\\n  ...ShoppingCartDetailedView_orders\\n}\\n\\nfragment ShoppingCart_orders on OrderV2Type {\\n  relayId\\n  item {\\n    __typename\\n    relayId\\n    chain {\\n      identifier\\n    }\\n    ... on Node {\\n      __isNode: __typename\\n      id\\n    }\\n  }\\n  payment {\\n    relayId\\n    symbol\\n    id\\n  }\\n  ...ShoppingCartDetailedView_orders\\n  ...ShoppingCartFooter_orders\\n  ...useTotalPrice_orders\\n}\\n\\nfragment StringTraitFilter_data on StringTraitType {\\n  counts {\\n    count\\n    value\\n  }\\n  key\\n}\\n\\nfragment TokenPricePayment on PaymentAssetType {\\n  symbol\\n  chain {\\n    identifier\\n  }\\n  asset {\\n    imageUrl\\n    assetContract {\\n      blockExplorerLink\\n      id\\n    }\\n    id\\n  }\\n}\\n\\nfragment accounts_url on AccountType {\\n  address\\n  user {\\n    publicUsername\\n    id\\n  }\\n}\\n\\nfragment asset_edit_url on AssetType {\\n  assetContract {\\n    address\\n    chain\\n    id\\n  }\\n  tokenId\\n  collection {\\n    slug\\n    id\\n  }\\n}\\n\\nfragment asset_url on AssetType {\\n  assetContract {\\n    address\\n    id\\n  }\\n  tokenId\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment bundle_url on AssetBundleType {\\n  slug\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment collection_stats on CollectionType {\\n  statsV2 {\\n    totalListed\\n    numOwners\\n    totalQuantity\\n    totalSupply\\n    totalVolume {\\n      unit\\n    }\\n    floorPrice {\\n      unit\\n    }\\n  }\\n  collectionOffers(first: 1) {\\n    edges {\\n      node {\\n        priceType {\\n          eth\\n        }\\n        id\\n      }\\n    }\\n  }\\n}\\n\\nfragment collection_url on CollectionType {\\n  slug\\n  isCategory\\n}\\n\\nfragment itemEvents_data on AssetType {\\n  relayId\\n  assetContract {\\n    address\\n    id\\n  }\\n  tokenId\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment item_url on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  ... on AssetType {\\n    ...asset_url\\n  }\\n  ... on AssetBundleType {\\n    ...bundle_url\\n  }\\n}\\n\\nfragment useCollectionFees_collection on CollectionType {\\n  openseaSellerFeeBasisPoints\\n  totalCreatorFeeBasisPoints\\n}\\n\\nfragment useIsRarityEnabled_collection on CollectionType {\\n  slug\\n  enabledRarities\\n  isEligibleForRarity\\n}\\n\\nfragment useTotalPrice_orders on OrderV2Type {\\n  relayId\\n  perUnitPriceType {\\n    usd\\n    unit\\n  }\\n  dutchAuctionFinalPriceType {\\n    usd\\n    unit\\n  }\\n  openedAt\\n  closedAt\\n  payment {\\n    symbol\\n    ...TokenPricePayment\\n    id\\n  }\\n}\\n\\nfragment wallet_accountKey on AccountType {\\n  address\\n}\\n\",\"variables\":{\"collection\":\"${collectionSlug}\",\"collections\":[\"${collectionSlug}\"],\"collectionQuery\":null,\"includeHiddenCollections\":null,\"numericTraits\":null,\"query\":null,\"sortAscending\":true,\"sortBy\":\"UNIT_PRICE\",\"stringTraits\":null,\"toggles\":null,\"resultModel\":\"ASSETS\",\"showContextMenu\":true,\"includeCollectionFilter\":false,\"prioritizeBuyNow\":true}}`;
      const collectionData = await fetch(OPENSEA_API_BASE_URL, {
        headers: {
          ...headers,
          'x-signed-query':
            'fa8e5c54d32ed81dfe15e0942c3cc0404a7d856e2c99377fea41965b6a437379',
        },
        referrer: 'https://opensea.io/',
        referrerPolicy: 'strict-origin',
        body,
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((res) => res.data.collection);
      const stats = collectionData.statsV2;
      collectionItem[1].contractAddress =
        collectionData.assetContracts?.edges?.[0]?.node?.address;
      collectionItem[1].floorPrice =
        Number.parseFloat(stats.floorPrice.unit).toFixed(3) * 1;
      collectionItem[1].isUnrevealed = collectionData.stringTraits.length <= 1;
      collectionItem[1].numberOfOwners = stats.numOwners;
      collectionItem[1].royalty =
        Number(collectionData.totalCreatorFeeBasisPoints) / 100;
      collectionItem[1].numberOfListed = stats.totalListed;
      collectionItem[1].totalSupply = stats.totalSupply;
      collectionItem[1].totalVolume =
        Number.parseFloat(stats.totalVolume.unit).toFixed(1) * 1;
    })
  );

const getCollections = async (date) => {
  let cursor = null;
  let requestNumber = 0;
  let newItems = 0;

  const results = {};
  do {
    logger.info(`Sending ${requestNumber + 1}. request...`);
    const body = `{\"id\":\"EventHistoryQuery\",\"query\":\"query EventHistoryQuery(\\n  $archetype: ArchetypeInputType\\n  $bundle: BundleSlug\\n  $collections: [CollectionSlug!]\\n  $categories: [CollectionSlug!]\\n  $chains: [ChainScalar!]\\n  $eventTypes: [EventType!]\\n  $cursor: String\\n  $count: Int = 16\\n  $showAll: Boolean = false\\n  $identity: IdentityInputType\\n) {\\n  ...EventHistory_data_L1XK6\\n}\\n\\nfragment AccountLink_data on AccountType {\\n  address\\n  config\\n  isCompromised\\n  user {\\n    publicUsername\\n    id\\n  }\\n  displayName\\n  ...ProfileImage_data\\n  ...wallet_accountKey\\n  ...accounts_url\\n}\\n\\nfragment AssetMediaAnimation_asset on AssetType {\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaAudio_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaContainer_asset_2V84VL on AssetType {\\n  backgroundColor\\n  ...AssetMediaEditions_asset_2V84VL\\n}\\n\\nfragment AssetMediaEditions_asset_2V84VL on AssetType {\\n  decimals\\n}\\n\\nfragment AssetMediaImage_asset on AssetType {\\n  backgroundColor\\n  imageUrl\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n}\\n\\nfragment AssetMediaPlaceholderImage_asset on AssetType {\\n  collection {\\n    displayData {\\n      cardDisplayStyle\\n    }\\n    id\\n  }\\n}\\n\\nfragment AssetMediaVideo_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMediaWebgl_asset on AssetType {\\n  backgroundColor\\n  ...AssetMediaImage_asset\\n}\\n\\nfragment AssetMedia_asset on AssetType {\\n  animationUrl\\n  displayImageUrl\\n  imageUrl\\n  isDelisted\\n  ...AssetMediaAnimation_asset\\n  ...AssetMediaAudio_asset\\n  ...AssetMediaContainer_asset_2V84VL\\n  ...AssetMediaImage_asset\\n  ...AssetMediaPlaceholderImage_asset\\n  ...AssetMediaVideo_asset\\n  ...AssetMediaWebgl_asset\\n}\\n\\nfragment CollectionCell_collection on CollectionType {\\n  name\\n  imageUrl\\n  isVerified\\n  ...collection_url\\n}\\n\\nfragment CollectionCell_trait on TraitType {\\n  traitType\\n  value\\n}\\n\\nfragment CollectionLink_assetContract on AssetContractType {\\n  address\\n  blockExplorerLink\\n}\\n\\nfragment CollectionLink_collection on CollectionType {\\n  name\\n  verificationStatus\\n  ...collection_url\\n}\\n\\nfragment EventHistory_data_L1XK6 on Query {\\n  assetEvents(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, chains: $chains, eventTypes: $eventTypes, identity: $identity, includeHidden: true) {\\n    edges {\\n      node {\\n        collection {\\n          ...CollectionCell_collection\\n          id\\n        }\\n        traitCriteria {\\n          ...CollectionCell_trait\\n          id\\n        }\\n        itemQuantity\\n        item @include(if: $showAll) {\\n          __typename\\n          relayId\\n          verificationStatus\\n          collection {\\n            ...CollectionLink_collection\\n            id\\n          }\\n          ...ItemCell_data\\n          ...item_url\\n          ... on AssetType {\\n            assetContract {\\n              ...CollectionLink_assetContract\\n              id\\n            }\\n          }\\n          ... on Node {\\n            __isNode: __typename\\n            id\\n          }\\n        }\\n        relayId\\n        eventTimestamp\\n        eventType\\n        orderExpired\\n        customEventName\\n        ...utilsAssetEventLabel\\n        creatorFee {\\n          unit\\n        }\\n        devFeePaymentEvent {\\n          ...EventTimestamp_data\\n          id\\n        }\\n        fromAccount {\\n          address\\n          ...AccountLink_data\\n          id\\n        }\\n        perUnitPrice {\\n          unit\\n          eth\\n          usd\\n        }\\n        endingPriceType {\\n          unit\\n        }\\n        payment {\\n          ...TokenPricePayment\\n          id\\n        }\\n        seller {\\n          ...AccountLink_data\\n          id\\n        }\\n        toAccount {\\n          ...AccountLink_data\\n          id\\n        }\\n        winnerAccount {\\n          ...AccountLink_data\\n          id\\n        }\\n        ...EventTimestamp_data\\n        id\\n        __typename\\n      }\\n      cursor\\n    }\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n    }\\n  }\\n}\\n\\nfragment EventTimestamp_data on AssetEventType {\\n  eventTimestamp\\n  transaction {\\n    blockExplorerLink\\n    id\\n  }\\n}\\n\\nfragment ItemCell_data on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  name\\n  collection {\\n    name\\n    id\\n  }\\n  ...item_url\\n  ... on AssetType {\\n    ...AssetMedia_asset\\n  }\\n  ... on AssetBundleType {\\n    assetQuantities(first: 2) {\\n      edges {\\n        node {\\n          asset {\\n            name\\n            ...AssetMedia_asset\\n            id\\n          }\\n          relayId\\n          id\\n        }\\n      }\\n    }\\n  }\\n}\\n\\nfragment ProfileImage_data on AccountType {\\n  imageUrl\\n}\\n\\nfragment TokenPricePayment on PaymentAssetType {\\n  symbol\\n  chain {\\n    identifier\\n  }\\n  asset {\\n    imageUrl\\n    assetContract {\\n      blockExplorerLink\\n      id\\n    }\\n    id\\n  }\\n}\\n\\nfragment accounts_url on AccountType {\\n  address\\n  user {\\n    publicUsername\\n    id\\n  }\\n}\\n\\nfragment asset_url on AssetType {\\n  assetContract {\\n    address\\n    id\\n  }\\n  tokenId\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment bundle_url on AssetBundleType {\\n  slug\\n  chain {\\n    identifier\\n  }\\n}\\n\\nfragment collection_url on CollectionType {\\n  slug\\n  isCategory\\n}\\n\\nfragment item_url on ItemType {\\n  __isItemType: __typename\\n  __typename\\n  ... on AssetType {\\n    ...asset_url\\n  }\\n  ... on AssetBundleType {\\n    ...bundle_url\\n  }\\n}\\n\\nfragment utilsAssetEventLabel on AssetEventType {\\n  isMint\\n  isAirdrop\\n  eventType\\n}\\n\\nfragment wallet_accountKey on AccountType {\\n  address\\n}\\n\",\"variables\":{\"archetype\":null,\"bundle\":null,\"collections\":[],\"categories\":null,\"chains\":[\"ETHEREUM\"],\"eventTypes\":[\"AUCTION_SUCCESSFUL\"],\"cursor\":null,\"count\":16,\"showAll\":true,\"identity\":null}}`;
    const response = await axios
      .post(OPENSEA_API_BASE_URL, JSON.parse(body), {
        headers: {
          ...headers,
          'x-signed-query':
            '4870373aefa67d877749b2f3c6af48d045ec72bf67182c352eeb3896c39f7403',
        },
      })
      .then((res) => res.data.data.assetEvents);
    cursor = response.pageInfo.endCursor;
    newItems = response.edges.length || 0;
    response.edges.forEach((event) => {
      const node = event?.node;
      const collectionName = node?.collection?.name;
      if (!collectionName) return;
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
        return;
      }
      results[collectionName] = {
        slug: node?.collection?.slug,
        acceptedBids,
        buyers: [buyer],
        prices: [price],
        tokenId,
        numberOfSales: 1,
      };
      return;
    });
    requestNumber += 1;
    logger.info(`Got ${newItems} events, finished ${requestNumber}. request`);
  } while (false /*cursor && newItems !== 0*/);

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

const getMessageForEmptyList = (minutes, date) =>
  `There are no bought NFTs in last ${minutes} minute${
    minutes > 1 ? 's' : ''
  } (after ${getTimezoneDate(date)})`;

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
    if (sortedCollections.length === 0) {
      return getMessageForEmptyList(minutes, date);
    }
    logger.info('Adding collections info...');
    await addCollectionsInfo(sortedCollections);
    logger.info('Added collections info...');

    const filteredCollections = getFilteredCollections(sortedCollections);
    if (filteredCollections.length === 0) {
      return getMessageForEmptyList(minutes, date);
    }

    // logger.info('Adding minting info...');
    // await addMintingInfo(filteredCollections);
    // logger.info('Added minting info...');

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
