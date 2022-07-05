const protocols = ["ERC721", "ERC1155"];

module.exports = async function App(context) {
  try {
    const date = new Date();
    const updatedDate = new Date();
    updatedDate.setTime(date.getTime() - 60 * 1000);
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
      const response = await fetch(url.toString(), {
        headers,
      }).then((res) => res.json());
      next = response.next;
      newItems = response.asset_events.length || 0;
      response.asset_events.forEach((event) => {
        const schemaNema = event.asset?.asset_contract?.schema_name;
        if (!protocols.includes(schemaNema)) {
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
    } while (next && newItems !== 0 && requestNumber <= 10);
    const sorted = Object.entries(results)
      .sort((a, b) => b[1].numberOfSales - a[1].numberOfSales)
      .slice(0, 5);
    if (sorted.length === 0) {
      return context.sendMessage(
        `There are no bought NFTs after ${updatedDate.toLocaleTimeString()}`
      );
    }
    const response = sorted
      .map((result) => {
        const uniqueBuyers = [...new Set(result[1].buyers)].length;
        return `<a href="https://opensea.io/collection/${result[1].slug}">${result[0]}</a>: ${result[1].numberOfSales}, unique buyers: ${uniqueBuyers}`;
      })
      .join('\n');
    await context.sendMessage(
      `Bought NFTs after ${updatedDate.toLocaleTimeString()}\n${response}`,
      {
        parseMode: 'HTML',
      }
    );
  } catch (error) {
    console.error('Request failed', error);
    await context.sendText(`Request failed: ${error.message}`);
  }
};
