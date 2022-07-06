const { getTime } = require('./utils');

describe('getTime', () => {
  it('should return time from the message', () => {
    expect(getTime('2')).toEqual([120, 2]);
  });

  it('should return default time', () => {
    expect(getTime('test')).toEqual([60, 1]);
  });
});
