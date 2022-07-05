const axios = require('axios');
const PROTOCOLS = ['ERC721', 'ERC1155'];
const TIMEOUT = 3000;

module.exports = async function App(context) {
  try {
    const textMessage = context._requestContext?.body?.message?.text;
    const minutes = [1, 2, 5, 10];
    const isMinute = minutes.includes(Number(textMessage));
    let seconds = 60;
    let chosenMinutes = 1;
    if (isMinute) {
      chosenMinutes = Number(textMessage);
      seconds = 60 * Number(textMessage);
    }

    const date = new Date();
    const updatedDate = new Date();
    updatedDate.setTime(date.getTime() - seconds * 1000);
    const params = {
      event_type: 'successful',
      occurred_after: Math.floor(updatedDate.getTime() / 1000),
    };
    const headers = {
      'x-api-key': process.env.OPENSEA_API_KEY,
    };
    let next;
    let results = {};
    let requestNumber = 0;
    let newItems = 0;

    do {
      console.log(`Sending ${requestNumber + 1}. request...`);
      const queryParams = {
        ...params,
        ...(next && { cursor: next }),
      };
      const url = new URL('https://api.opensea.io/api/v1/events');
      url.search = new URLSearchParams(queryParams);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      const response = await fetch(url.toString(), {
        headers,
        signal: controller.signal,
      }).then((res) => res.json());
      clearTimeout(timeoutId);
      next = response.next;
      newItems = response.asset_events.length || 0;
      response.asset_events.forEach((event) => {
        const schemaNema = event.asset?.asset_contract?.schema_name;
        if (!PROTOCOLS.includes(schemaNema)) {
          console.log(`Skipping ${schemaNema}`);
          return;
        }
        const collectionName = event.asset?.collection?.name;
        if (!collectionName) return;
        const buyer = event.winner_account.address;
        if (results[collectionName]) {
          results[collectionName].buyers.push(buyer);
          return (results[collectionName].numberOfSales += 1);
        }
        return (results[collectionName] = {
          slug: event.asset?.collection?.slug,
          buyers: [buyer],
          numberOfSales: 1,
        });
      });
      requestNumber += 1;
      console.log(
        `Got ${response.asset_events.length} events, ${requestNumber}. request`
      );
    } while (next && newItems !== 0);
    const sorted = Object.entries(results)
      .sort((a, b) => b[1].numberOfSales - a[1].numberOfSales)
      .slice(0, 5);
    if (sorted.length === 0) {
      return context.sendMessage(
        `There are no bought NFTs in last ${chosenMinutes} minute${
          chosenMinutes > 1 ? 's' : ''
        } (after ${updatedDate.toLocaleTimeString()})`
      );
    }
    for (const collectionItem of sorted) {
      const url = `https://api.opensea.io/api/v1/collection/${collectionItem[1].slug}`;
      const collectionData = await fetch(url, {
        headers,
      })
        .then((res) => res.json())
        .then((res) => res.collection);
      collectionItem[1].totalSupply = collectionData.stats.total_supply;
      collectionItem[1].numberOfOwners = collectionData.stats.num_owners;
      collectionItem[1].floorPrice = collectionData.stats.floor_price;
      collectionItem[1].totalVolume = Number.parseFloat(
        collectionData.stats.total_volume
      ).toFixed(1);
    }
    const response = sorted
      .map((result) => {
        const uniqueBuyers = [...new Set(result[1].buyers)].length;
        return `<a href="https://opensea.io/collection/${result[1].slug}">${result[0]}</a>: ${result[1].numberOfSales} sales\nunique buyers: ${uniqueBuyers}\nfloor: ${result[1].floorPrice}\ntotal volume: ${result[1].totalVolume}\ntotal supply: ${result[1].totalSupply}\nnumber of owners: ${result[1].numberOfOwners}
        `;
      })
      .join('\n');
    await context.sendMessage(
      `Bought NFTs in last ${chosenMinutes} minute${
        chosenMinutes > 1 ? 's' : ''
      } (after ${updatedDate.toLocaleTimeString()})\n${response}`,
      {
        parseMode: 'HTML',
      }
    );
  } catch (error) {
    console.error('Request failed', error);
    await context.sendText(`Request failed: ${error.message}`);
  }
};
