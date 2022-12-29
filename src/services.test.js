const {
  formatResponse,
  getSortedCollections,
  getFilteredCollections,
} = require('./services');
const { createDate } = require('./utils');

describe('formatResponse', () => {
  it('should format response', () => {
    const collections = [
      {
        collectionName: 'nft',
        acceptedBids: 2,
        averagePrice: 0.8,
        uniqueBuyers: 3,
        uniqueSellers: 3,
        createdDate: createDate('2020-12-12'),
        floorPrice: 0.5,
        isMinting: true,
        isVerified: true,
        isUnrevealed: true,
        numberOfListed: 2000,
        numberOfOwners: 3000,
        numberOfSales: 4,
        oneDayVolume: 22,
        oneHourSales: 4,
        prices: [0.5, 0.9, 0.7, 0.2],
        royalty: 2.5,
        slug: 'nft',
        totalSupply: 5000,
        totalVolume: 34,
        twitterUsername: 'nft',
      },
      {
        collectionName: 'nft2',
        acceptedBids: 1,
        uniqueBuyers: 3,
        uniqueSellers: 2,
        createdDate: createDate('2020-12-12'),
        floorPrice: 0.5,
        isMinting: true,
        isUnrevealed: true,
        numberOfListed: 2000,
        numberOfOwners: 3000,
        numberOfSales: 1,
        oneDaySales: 200,
        prices: [0.5],
        royalty: 2.5,
        slug: 'nft2',
        totalSupply: 5000,
        totalVolume: 34,
      },
      {
        collectionName: 'nft3',
        acceptedBids: 1,
        averagePrice: 0.8,
        uniqueBuyers: 1,
        uniqueSellers: 1,
        createdDate: createDate('2020-12-12'),
        floorPrice: 0.5,
        isMinting: true,
        isUnrevealed: true,
        numberOfListed: 2000,
        numberOfOwners: 3000,
        numberOfSales: 1,
        oneDayVolume: 22,
        oneHourAveragePrice: 0.6,
        oneHourSales: 4,
        prices: [0.5, 0.9, 0.7, 0.2],
        royalty: 2.5,
        slug: 'nft3',
        totalSupply: 5000,
        totalVolume: 34,
        twitterUsername: 'nft3',
      },
    ];
    const expectedResult = `&#x2713; <a href="https://gem.xyz/collection/nft">nft</a>: 4 sales (2 accepted bids)\nunique buyers: 3\nunique sellers: 3\nMINTING\nUNREVEALED\nsold for 0.2 - 0.9eth\nfloor: 0.5eth\naverage price: 0.8eth\none hour sales: 4\ntotal volume: 34eth\nlisted/supply: 2000/5000\nowners/supply: 3000/5000\nroyalty: 2.5%\ncreation date: 12 December 2020\n<a href="https://twitter.com/nft">twitter</a>\n<a href="https://coniun.io/collection/nft/dashboard">dashboard</a>\n\n<a href="https://gem.xyz/collection/nft2">nft2</a>: 1 sale (1 accepted bid)\nMINTING\nUNREVEALED\nsold for 0.5eth\nfloor: 0.5eth\ntotal volume: 34eth\nlisted/supply: 2000/5000\nowners/supply: 3000/5000\nroyalty: 2.5%\ncreation date: 12 December 2020\n<a href="https://coniun.io/collection/nft2/dashboard">dashboard</a>\n\n<a href="https://gem.xyz/collection/nft3">nft3</a>: 1 sale (1 accepted bid)\nMINTING\nUNREVEALED\nsold for 0.2 - 0.9eth\nfloor: 0.5eth\none hour average price: 0.6eth\naverage price: 0.8eth\none hour sales: 4\ntotal volume: 34eth\nlisted/supply: 2000/5000\nowners/supply: 3000/5000\nroyalty: 2.5%\ncreation date: 12 December 2020\n<a href="https://twitter.com/nft3">twitter</a>\n<a href="https://coniun.io/collection/nft3/dashboard">dashboard</a>\n`;

    const result = formatResponse(collections);

    expect(result).toEqual(expectedResult);
  });
});

describe('getFilteredCollections', () => {
  it('should return filtered collections', () => {
    const collections = [
      {
        collectionName: 'nft1',
        floorPrice: 1,
        isEthereumCollection: true,
        numberOfOwners: 2000,
        totalSupply: 4000,
        totalVolume: 32,
      },
      {
        collectionName: 'nft2',
        floorPrice: 0.005,
        isEthereumCollection: true,
        numberOfOwners: 3000,
        totalSupply: 4000,
        totalVolume: 32,
      },
      {
        collectionName: 'nft4',
        floorPrice: 1,
        isEthereumCollection: true,
        numberOfOwners: 5000,
        totalSupply: 20000,
        totalVolume: 32,
      },
      {
        collectionName: 'nft5',
        floorPrice: 1,
        isEthereumCollection: true,
        numberOfOwners: 1000,
        totalSupply: 2000,
        totalVolume: 12,
      },
      {
        collectionName: 'nft6',
        floorPrice: 1,
        isEthereumCollection: true,
        numberOfOwners: 5000,
        totalSupply: 4000,
        totalVolume: 32,
      },
      {
        collectionName: 'nft7',
        floorPrice: 1,
        isEthereumCollection: true,
        numberOfOwners: 500,
        totalSupply: 900,
        totalVolume: 32,
      },
    ];
    const expectedResult = [collections[0]];

    const result = getFilteredCollections(collections);

    expect(result).toEqual(expectedResult);
  });
});

describe('getSortedCollections', () => {
  it('should return sorted collections', () => {
    const collections = {
      nft1: {
        numberOfSales: 2,
      },
      nft2: {
        numberOfSales: 4,
      },
      nft3: {
        numberOfSales: 6,
      },
      nft4: {
        numberOfSales: 8,
      },
      nft5: {
        numberOfSales: 3,
      },
      nft6: {
        numberOfSales: 5,
      },
      nft7: {
        numberOfSales: 1,
      },
      nft8: {
        numberOfSales: 10,
      },
    };
    const sortedCollections = [
      {
        collectionName: 'nft8',
        numberOfSales: 10,
      },
      {
        collectionName: 'nft4',
        numberOfSales: 8,
      },
      {
        collectionName: 'nft3',
        numberOfSales: 6,
      },
      {
        collectionName: 'nft6',
        numberOfSales: 5,
      },
      {
        collectionName: 'nft2',
        numberOfSales: 4,
      },
      {
        collectionName: 'nft5',
        numberOfSales: 3,
      },
      {
        collectionName: 'nft1',
        numberOfSales: 2,
      },
    ];

    const result = getSortedCollections(collections);

    expect(result).toEqual(sortedCollections);
  });
});
