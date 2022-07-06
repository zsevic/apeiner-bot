const isEmptyObject = (obj) => Object.keys(obj).length === 0;

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

const getDate = (seconds) => {
  const date = new Date();
  const updatedDate = new Date();
  updatedDate.setTime(date.getTime() - seconds * 1000);

  return updatedDate;
};

module.exports = {
  isEmptyObject,
  getDate,
  getTime,
};
