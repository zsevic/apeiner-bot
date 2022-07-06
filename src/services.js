const formatResponse = (filteredCollections) =>
  filteredCollections
    .map((result) => {
      const uniqueBuyers = [...new Set(result[1].buyers)].length;
      return `<a href="https://opensea.io/collection/${result[1].slug}">${
        result[0]
      }</a>: ${result[1].numberOfSales} sale${
        result[1].numberOfSales > 1 ? 's' : ''
      }\nunique buyers: ${uniqueBuyers}\n${
        result[1].isUnrevealed ? 'UNREVEALED\n' : ''
      }floor: ${result[1].floorPrice}eth\naverage price: ${
        result[1].averagePrice
      }eth\ntotal volume: ${result[1].totalVolume}eth\nlisted/supply: ${
        result[1].numberOfListed
      }/${result[1].totalSupply}\nowners/supply: ${result[1].numberOfOwners}/${
        result[1].totalSupply
      }\n`;
    })
    .join('\n');

module.exports = {
  formatResponse,
};
