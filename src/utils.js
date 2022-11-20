const { DATETIME_FORMAT } = require('./constants');
/**
 *
 * @param {string} message
 * @returns {Array.<number>}
 */
const getTime = (message) => {
  const minutes = [1, 2, 3, 5, 10];
  const isMinute = minutes.includes(Number(message));
  let seconds = 60;
  let chosenMinutes = 1;
  if (isMinute) {
    chosenMinutes = Number(message);
    seconds = 60 * Number(message);
  }

  return [seconds, chosenMinutes];
};
/**
 *
 * @param {Date} date
 * @returns {string}
 */
const createDate = (date) =>
  new Intl.DateTimeFormat(DATETIME_FORMAT, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
/**
 *
 * @param {number} seconds
 * @returns {Date}
 */
const getDate = (seconds) => {
  const date = new Date();
  const updatedDate = new Date();
  updatedDate.setTime(date.getTime() - seconds * 1000);

  return updatedDate;
};

module.exports = {
  createDate,
  getDate,
  getTime,
};
