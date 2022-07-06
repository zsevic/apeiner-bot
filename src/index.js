const { logger } = require('./logger');
const {
  addCollectionsInfo,
  addListingInfo,
  getCollections,
  getFilteredCollections,
  getSortedCollections,
  getMessageForEmptyList,
  getResponse,
} = require('./services');
const { getDate, getTime } = require('./utils');

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
    logger.info('Adding collections info...');
    await addCollectionsInfo(sortedCollections);
    logger.info('Added collections info...');

    const filteredCollections = getFilteredCollections(sortedCollections);
    if (filteredCollections.length === 0) {
      return context.sendMessage(getMessageForEmptyList(minutes, date));
    }

    logger.info('Adding listings info...');
    await addListingInfo(filteredCollections);
    logger.info('Added listings info...');

    const response = getResponse(filteredCollections, minutes, date);
    await context.sendMessage(response, {
      parseMode: 'HTML',
    });
  } catch (error) {
    logger.error(error, error.message);
    await context.sendText(`Request failed: ${error.message}`);
  }
};
