module.exports = async function App(context) {
  try {
    const date = new Date(Date.now() - 1000 * 60);
    const params = {
      event_type: 'successful',
      occurred_after: Math.floor(date.getTime() / 1000),
    };
    const url = 'https://api.opensea.io/api/v1/events';
    const headers = {
      'x-api-key': process.env.OPENSEA_API_KEY,
    };
    let next;
    let results = {};
    let counter = 0;

    do {
      const response = await fetch(
        `${url}?event_type=${params.event_type}&occurred_after=${params.occurred_after}`,
        {
          headers,
        }
      ).then((res) => res.json());
      next = response.next;
      response.asset_events.forEach((event) => {
        const collectionName = event.asset?.collection?.name;
        if (!collectionName) return;
        if (results[collectionName]) {
          return (results[collectionName].numberOfSales += 1);
        }
        return (results[collectionName] = {
          slug: event.asset?.collection?.slug,
          numberOfSales: 1,
        });
      });
      counter += 1;
      console.log(
        `Got ${response.asset_events.length} events, ${counter}. request`
      );
    } while (next && counter <= 10);
    const sorted = Object.entries(results).sort(
      (a, b) => b[1].numberOfSales - a[1].numberOfSales
    );
    const response = sorted
      .map(
        (result) =>
          `<a href="https://opensea.io/collection/${result[1].slug}">${result[0]}</a>: ${result[1].numberOfSales}`
      )
      .join('\n');
    await context.sendMessage(response, {
      parseMode: 'HTML',
    });
  } catch (error) {
    console.error('Request failed', error.message);
    await context.sendText(`Request failed: ${error.message}`);
  }
};
