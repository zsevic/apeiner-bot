const { formatResponse, getSortedCollections } = require('./services');

describe('formatResponse', () => {
  it('should format response', () => {
    const collections = [
      [
        'nft',
        {
          averagePrice: 0.4,
          buyers: ['0x1234', '0x1234', '0x1235', '0x1236'],
          floorPrice: 0.5,
          isUnrevealed: true,
          numberOfListed: 2000,
          numberOfOwners: 3000,
          numberOfSales: 4,
          slug: 'nft',
          totalSupply: 5000,
          totalVolume: 34,
        },
      ],
    ];
    const expectedResult = `<a href=\"https://opensea.io/collection/nft\">nft</a>: 4 sales\nunique buyers: 3\nUNREVEALED\nfloor: 0.5eth\naverage price: 0.4eth\ntotal volume: 34eth\nlisted/supply: 2000/5000\nowners/supply: 3000/5000\n`;

    const result = formatResponse(collections);

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
