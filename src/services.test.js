const {
  formatResponse,
  getSortedCollections,
  getFilteredCollections,
} = require('./services');

describe('formatResponse', () => {
  it('should format response', () => {
    const collections = [
      [
        'nft',
        {
          averagePrice: 0.4,
          buyers: ['0x1234', '0x1234', '0x1235', '0x1236'],
          floorPrice: 0.5,
          isMinting: true,
          isUnrevealed: true,
          numberOfListed: 2000,
          numberOfOwners: 3000,
          numberOfSales: 4,
          royalty: 2.5,
          slug: 'nft',
          totalSales: 1203,
          totalSupply: 5000,
          totalVolume: 34,
        },
      ],
    ];
    const expectedResult = `<a href="https://opensea.io/collection/nft">nft</a>: 4 sales\nunique buyers: 3\nMINTING\nUNREVEALED\nfloor: 0.5eth\naverage price: 0.4eth\ntotal volume: 34eth\nlisted/supply: 2000/5000\nowners/supply: 3000/5000\ntotal sales: 1203\nroyalty: 2.5%\n`;

    const result = formatResponse(collections);

    expect(result).toEqual(expectedResult);
  });
});

describe('getFilteredCollections', () => {
  it('should return filtered collections', () => {
    const collections = [
      [
        'nft1',
        {
          floorPrice: 1,
          isEthereumCollection: true,
          numberOfOwners: 2000,
          totalSupply: 4000,
          totalVolume: 32,
        },
      ],
      [
        'nft2',
        {
          floorPrice: 0.005,
          isEthereumCollection: true,
          numberOfOwners: 3000,
          totalSupply: 4000,
          totalVolume: 32,
        },
      ],
      [
        'nft3',
        {
          floorPrice: 1,
          isEthereumCollection: false,
          numberOfOwners: 3000,
          totalSupply: 4000,
          totalVolume: 32,
        },
      ],
      [
        'nft4',
        {
          floorPrice: 1,
          isEthereumCollection: true,
          numberOfOwners: 5000,
          totalSupply: 20000,
          totalVolume: 32,
        },
      ],
      [
        'nft5',
        {
          floorPrice: 1,
          isEthereumCollection: true,
          numberOfOwners: 1000,
          totalSupply: 2000,
          totalVolume: 12,
        },
      ],
      [
        'nft6',
        {
          floorPrice: 1,
          isEthereumCollection: true,
          numberOfOwners: 5000,
          totalSupply: 4000,
          totalVolume: 32,
        },
      ],
      [
        'nft7',
        {
          floorPrice: 1,
          isEthereumCollection: true,
          numberOfOwners: 500,
          totalSupply: 900,
          totalVolume: 32,
        },
      ],
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
      [
        'nft8',
        {
          numberOfSales: 10,
        },
      ],
      [
        'nft4',
        {
          numberOfSales: 8,
        },
      ],
      [
        'nft3',
        {
          numberOfSales: 6,
        },
      ],
      [
        'nft6',
        {
          numberOfSales: 5,
        },
      ],
      [
        'nft2',
        {
          numberOfSales: 4,
        },
      ],
      [
        'nft5',
        {
          numberOfSales: 3,
        },
      ],
      [
        'nft1',
        {
          numberOfSales: 2,
        },
      ],
    ];

    const result = getSortedCollections(collections);

    expect(result).toEqual(sortedCollections);
  });
});
