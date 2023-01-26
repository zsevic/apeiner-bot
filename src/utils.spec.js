const { getTime, getStatusMessage, isValidWalletAddress } = require('./utils');

describe('getStatusMessage', () => {
  it('should return status message for 1 minute', () => {
    expect(getStatusMessage(1)).toEqual('Getting stats for last 1 minute...');
  });

  it('should return status message for more than 1 minute', () => {
    expect(getStatusMessage(2)).toEqual('Getting stats for last 2 minutes...');
  });
});

describe('isValidWalletAddress', () => {
  it('should return false when wallet address is not passed', () => {
    expect(isValidWalletAddress()).toEqual(false);
  });

  it('should return true when wallet address finishes with eth suffix', () => {
    expect(isValidWalletAddress('tester.eth')).toEqual(true);
  });

  it('should return true when wallet address is valid', () => {
    expect(
      isValidWalletAddress('0xb794f5ea0ba39494ce839613fffba74279579268')
    ).toEqual(true);
  });

  it('should return false when wallet address is not valid', () => {
    expect(
      isValidWalletAddress('0xb794f5ea0ba39494ce839613fffba7427957926w')
    ).toEqual(false);
  });

  it('should return false when wallet address is not valid', () => {
    expect(isValidWalletAddress('zz')).toEqual(false);
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
