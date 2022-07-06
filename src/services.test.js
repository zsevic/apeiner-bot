const { formatResponse } = require('./services');

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
