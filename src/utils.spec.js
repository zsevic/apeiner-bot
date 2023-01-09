const { getTime, getStatusMessage } = require('./utils');

describe('getStatusMessage', () => {
  it('should return status message for 1 minute', () => {
    expect(getStatusMessage(1)).toEqual('Getting stats for last 1 minute...');
  });

  it('should return status message for more than 1 minute', () => {
    expect(getStatusMessage(2)).toEqual('Getting stats for last 2 minutes...');
  });
});

describe('getTime', () => {
  it('should return time from the message', () => {
    expect(getTime('2')).toEqual([120, 2]);
  });

  it('should return default time', () => {
    expect(getTime('test')).toEqual([60, 1]);
  });
});
