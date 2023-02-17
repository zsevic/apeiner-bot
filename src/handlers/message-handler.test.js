const { HandleMessage } = require('./message-handler');
const {
  CHAT_ID,
  defaultAdminReply,
  defaultReply,
  PAUSED_DEFAULT_MESSAGE,
  ACTIVATED_DEFAULT_MESSAGE,
} = require('../constants');
const nftApi = require('../gateways/nft-api');
const userRepository = require('../gateways/user-repository');
const utils = require('../utils');

const firstGetEventsResponse = require('./mocks/data/get-events-1.json');

const firstGetCollectionInfoResponse = require('./mocks/data/get-collection-info-1.json');
const secondGetCollectionInfoResponse = require('./mocks/data/get-collection-info-2.json');
const thirdGetCollectionInfoResponse = require('./mocks/data/get-collection-info-3.json');
const fourthGetCollectionInfoResponse = require('./mocks/data/get-collection-info-4.json');
const fifthGetCollectionInfoResponse = require('./mocks/data/get-collection-info-5.json');
const sixthGetCollectionInfoResponse = require('./mocks/data/get-collection-info-6.json');
const seventhGetCollectionInfoResponse = require('./mocks/data/get-collection-info-7.json');

const firstGetAssetEventsResponse = require('./mocks/data/get-asset-events-1.json');
const secondGetAssetEventsResponse = require('./mocks/data/get-asset-events-2.json');
const thirdGetAssetEventsResponse = require('./mocks/data/get-asset-events-3.json');

const firstGetCollectionStatsResponse = require('./mocks/data/get-collection-stats-1.json');
const secondGetCollectionStatsResponse = require('./mocks/data/get-collection-stats-2.json');
const thirdGetCollectionStatsResponse = require('./mocks/data/get-collection-stats-3.json');

describe('HandleMessage', () => {
  const results = `Bought NFTs in last 1 minute (after 1:00:00 AM)\n\n&#x2713; <a href="https://gem.xyz/collection/thememes6529">The Memes by 6529</a>: 3 sales\nunique buyers: 1\nunique sellers: 3\nsold for 0.22 - 0.224eth\nfloor: 0.092eth\nbest offer: 0.08weth\none hour average price: 0.091eth\naverage price: 0.12eth\none hour sales: 17\ntotal sales: 9350\ntotal volume: 1120.4eth\nlisted/supply: 187/2000\nowners/supply: 1063/2000\nroyalty: 0%\ncreation date: 24 November 2022\n<a href="https://twitter.com/cryptobirbsnft">twitter</a>\n<a href="https://coniun.io/collection/thememes6529/dashboard">dashboard</a>\n\n<a href="https://gem.xyz/collection/emblem-vault">Emblem Vault [Ethereum]</a>: 1 sale\nsold for 1.15eth\nfloor: 0.58eth\nbest offer: 1.122weth\none hour average price: 1.229eth\naverage price: 0.878eth\none hour sales: 12\ntotal sales: 3631\ntotal volume: 3186.8eth\nlisted/supply: 579/5611\nowners/supply: 1804/5611\nroyalty: 0%\ncreation date: 12 February 2023\n<a href="https://twitter.com/jackbutcher">twitter</a>\n<a href="https://coniun.io/collection/emblem-vault/dashboard">dashboard</a>\n\n&#x2713; <a href="https://gem.xyz/collection/vv-checks-originals">Checks - VV Originals</a>: 1 sale\nsold for 3.9eth\nfloor: 0.011eth\nbest offer: 0.008weth\none hour average price: 0.023eth\naverage price: 0.097eth\ntotal sales: 13571\ntotal volume: 1318.2eth\nlisted/supply: 213/7777\nowners/supply: 1614/7777\nroyalty: 7.5%\ncreation date: 31 March 2022\n<a href="https://twitter.com/DreadfulzNFT">twitter</a>\n<a href="https://coniun.io/collection/vv-checks-originals/dashboard">dashboard</a>\n`;
  describe('admin', () => {
    describe('/users command', () => {
      it('should return error message command is not valid', async () => {
        const context = {
          event: {
            text: '/users',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };

        await HandleMessage(context);

        expect(context.sendMessage).toBeCalledWith(
          'Command is not valid',
          defaultAdminReply
        );
      });

      it('should return user stats', async () => {
        const context = {
          event: {
            text: '/users stats',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getNumberOfUsers').mockResolvedValue(2);
        jest
          .spyOn(userRepository, 'getNumberOfSubscribedUsers')
          .mockResolvedValue(1);
        jest
          .spyOn(userRepository, 'getNumberOfActiveUsers')
          .mockResolvedValue(1);

        await HandleMessage(context);

        expect(context.sendMessage).toBeCalledWith(
          '2 total user(s), 1 subscribed, 1 active',
          defaultAdminReply
        );
      });
    });

    describe('/subscribe command', () => {
      it('should return error message when wallet address is not valid', async () => {
        const context = {
          event: {
            text: '/subscribe 0xb794f5ea0ba39494ce839613fffba7427957926w',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };

        await HandleMessage(context);

        expect(context.sendMessage).toBeCalledWith(
          'Wallet address is not valid, please try again',
          defaultAdminReply
        );
      });

      it('should return error message when user is not found', async () => {
        const context = {
          event: {
            text: '/subscribe 0xb794f5ea0ba39494ce839613fffba74279579268',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest
          .spyOn(userRepository, 'getUserByWalletAddress')
          .mockResolvedValue(null);

        await HandleMessage(context);

        expect(context.sendMessage).toBeCalledWith(
          'User is not found',
          defaultAdminReply
        );
      });

      it('should subscribe the user by given wallet address', async () => {
        const walletAddress = 'user.eth';
        const context = {
          event: {
            text: `/subscribe ${walletAddress}`,
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getUserByWalletAddress').mockResolvedValue({
          id: context.event._rawEvent.message.chat.id,
          username: 'user',
          wallet_address: walletAddress,
          is_subscribed: false,
          is_active: false,
          is_trial_active: false,
          created_at: '2023-01-26T22:37:33.220Z',
          updated_at: '2023-01-26T22:37:33.220Z',
        });
        jest.spyOn(userRepository, 'subscribe').mockResolvedValue(null);

        await HandleMessage(context);

        expect(context.sendMessage).toBeCalledWith(
          'User is subscribed successfully',
          defaultAdminReply
        );
      });
    });

    describe('/1 command', () => {
      it('should return default message when there are no events', async () => {
        const context = {
          event: {
            text: '/1',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(nftApi, 'getEvents').mockResolvedValue(null);
        jest.spyOn(utils, 'getDate').mockReturnValue(new Date('2023-02-17'));

        await HandleMessage(context);

        expect(context.sendMessage).toHaveBeenNthCalledWith(
          1,
          'Getting stats for last 1 minute...'
        );
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          2,
          'There are no bought NFTs in last 1 minute (after 1:00:00 AM)',
          defaultAdminReply
        );
      });

      it('should return results', async () => {
        const context = {
          event: {
            text: '/1',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };

        jest
          .spyOn(nftApi, 'getEvents')
          .mockResolvedValueOnce(firstGetEventsResponse)
          .mockResolvedValueOnce(null);
        jest
          .spyOn(nftApi, 'getCollectionInfo')
          .mockResolvedValueOnce(firstGetCollectionInfoResponse)
          .mockResolvedValueOnce(secondGetCollectionInfoResponse)
          .mockResolvedValueOnce(thirdGetCollectionInfoResponse)
          .mockResolvedValueOnce(fourthGetCollectionInfoResponse)
          .mockResolvedValueOnce(fifthGetCollectionInfoResponse)
          .mockResolvedValueOnce(sixthGetCollectionInfoResponse)
          .mockResolvedValueOnce(seventhGetCollectionInfoResponse);
        jest
          .spyOn(nftApi, 'getAssetEvents')
          .mockResolvedValueOnce(firstGetAssetEventsResponse)
          .mockResolvedValueOnce(secondGetAssetEventsResponse)
          .mockResolvedValueOnce(thirdGetAssetEventsResponse);
        jest
          .spyOn(nftApi, 'getCollectionStats')
          .mockResolvedValueOnce(firstGetCollectionStatsResponse)
          .mockResolvedValueOnce(secondGetCollectionStatsResponse)
          .mockResolvedValueOnce(thirdGetCollectionStatsResponse);

        jest.spyOn(utils, 'getDate').mockReturnValue(new Date('2023-02-17'));

        await HandleMessage(context);

        expect(context.sendMessage).toHaveBeenNthCalledWith(
          1,
          'Getting stats for last 1 minute...'
        );
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          2,
          results,
          defaultAdminReply
        );
      });

      it('should return error message when request to NFT API fails', async () => {
        const context = {
          event: {
            text: '/1',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: CHAT_ID,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        const errorMessage = 'Request failed with status 400';
        jest
          .spyOn(nftApi, 'getEvents')
          .mockRejectedValue(new Error(errorMessage));
        jest.spyOn(utils, 'getDate').mockReturnValue(new Date('2023-02-17'));

        await HandleMessage(context);

        expect(context.sendMessage).toHaveBeenNthCalledWith(
          1,
          'Getting stats for last 1 minute...'
        );
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          2,
          `Request failed: ${errorMessage}`,
          defaultAdminReply
        );
      });
    });
  });

  describe('user', () => {
    const userChatId = 1;
    const username = 'tester';
    const walletAddress = 'tester.eth';

    const user = {
      id: userChatId,
      username: username,
      wallet_address: walletAddress,
      is_subscribed: false,
      is_active: false,
      is_trial_active: false,
      created_at: '2023-01-26T22:37:33.220Z',
      updated_at: '2023-01-26T22:37:33.220Z',
    };

    describe('/start command', () => {
      it('should handle case when there are no events', async () => {
        const context = {
          event: {
            text: '/start',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: userChatId,
                  username,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
        const saveSpy = jest
          .spyOn(userRepository, 'saveUser')
          .mockResolvedValue(null);
        const activateTrialSpy = jest
          .spyOn(userRepository, 'activateTrial')
          .mockResolvedValue(null);
        jest.spyOn(nftApi, 'getEvents').mockResolvedValue(null);
        jest.spyOn(utils, 'getDate').mockReturnValue(new Date('2023-02-17'));

        await HandleMessage(context);

        expect(saveSpy).toBeCalledWith({
          id: userChatId,
          username,
        });
        expect(activateTrialSpy).toBeCalledWith(userChatId);
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          1,
          'Getting stats for last 1 minute...'
        );
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          2,
          'There are no bought NFTs in last 1 minute (after 1:00:00 AM)',
          defaultReply
        );
      });

      it('should return results for the new user', async () => {
        const context = {
          event: {
            text: '/start',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: userChatId,
                  username,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };

        jest
          .spyOn(nftApi, 'getEvents')
          .mockResolvedValueOnce(firstGetEventsResponse)
          .mockResolvedValueOnce(null);
        jest
          .spyOn(nftApi, 'getCollectionInfo')
          .mockResolvedValueOnce(firstGetCollectionInfoResponse)
          .mockResolvedValueOnce(secondGetCollectionInfoResponse)
          .mockResolvedValueOnce(thirdGetCollectionInfoResponse)
          .mockResolvedValueOnce(fourthGetCollectionInfoResponse)
          .mockResolvedValueOnce(fifthGetCollectionInfoResponse)
          .mockResolvedValueOnce(sixthGetCollectionInfoResponse)
          .mockResolvedValueOnce(seventhGetCollectionInfoResponse);
        jest
          .spyOn(nftApi, 'getAssetEvents')
          .mockResolvedValueOnce(firstGetAssetEventsResponse)
          .mockResolvedValueOnce(secondGetAssetEventsResponse)
          .mockResolvedValueOnce(thirdGetAssetEventsResponse);
        jest
          .spyOn(nftApi, 'getCollectionStats')
          .mockResolvedValueOnce(firstGetCollectionStatsResponse)
          .mockResolvedValueOnce(secondGetCollectionStatsResponse)
          .mockResolvedValueOnce(thirdGetCollectionStatsResponse);
        jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
        const saveSpy = jest
          .spyOn(userRepository, 'saveUser')
          .mockResolvedValue(null);
        const deactivateTrialSpy = jest
          .spyOn(userRepository, 'deactivateTrial')
          .mockResolvedValue(null);

        jest.spyOn(utils, 'getDate').mockReturnValue(new Date('2023-02-17'));

        await HandleMessage(context);

        expect(saveSpy).toBeCalledWith({
          id: userChatId,
          username,
        });
        expect(deactivateTrialSpy).toBeCalledWith(userChatId);
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          1,
          'Getting stats for last 1 minute...'
        );
        expect(context.sendMessage).toHaveBeenNthCalledWith(
          2,
          results,
          defaultReply
        );
      });

      it('should pause notifications', async () => {
        const context = {
          event: {
            text: '/pause',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: userChatId,
                  username,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getUserById').mockResolvedValue({
          ...user,
          is_subscribed: true,
          is_active: true,
        });
        const pauseSpy = jest
          .spyOn(userRepository, 'pause')
          .mockResolvedValue(null);

        await HandleMessage(context);

        expect(pauseSpy).toBeCalledWith(userChatId);
        expect(context.sendMessage).toBeCalledWith(
          PAUSED_DEFAULT_MESSAGE,
          defaultReply
        );
      });

      it('should return default message for active user', async () => {
        const context = {
          event: {
            text: '/some-command',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: userChatId,
                  username,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getUserById').mockResolvedValue({
          ...user,
          is_subscribed: true,
          is_active: true,
        });
        const pauseSpy = jest
          .spyOn(userRepository, 'pause')
          .mockResolvedValue(null);

        await HandleMessage(context);

        expect(pauseSpy).not.toHaveBeenCalled();
        expect(context.sendMessage).toBeCalledWith(
          ACTIVATED_DEFAULT_MESSAGE,
          defaultReply
        );
      });

      it('should activate notifications', async () => {
        const context = {
          event: {
            text: '/activate',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: userChatId,
                  username,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getUserById').mockResolvedValue({
          ...user,
          is_subscribed: true,
          is_active: false,
        });
        const activateSpy = jest
          .spyOn(userRepository, 'activate')
          .mockResolvedValue(null);

        await HandleMessage(context);

        expect(activateSpy).toBeCalledWith(userChatId);
        expect(context.sendMessage).toBeCalledWith(
          ACTIVATED_DEFAULT_MESSAGE,
          defaultReply
        );
      });

      it('should return default message for inactive user', async () => {
        const context = {
          event: {
            text: '/some-command',
            _rawEvent: {
              message: {
                entities: [
                  {
                    type: 'bot_command',
                  },
                ],
                chat: {
                  id: userChatId,
                  username,
                },
              },
            },
          },
          sendMessage: jest.fn(),
        };
        jest.spyOn(userRepository, 'getUserById').mockResolvedValue({
          ...user,
          is_subscribed: true,
          is_active: false,
        });
        const activateSpy = jest
          .spyOn(userRepository, 'activate')
          .mockResolvedValue(null);

        await HandleMessage(context);

        expect(activateSpy).not.toHaveBeenCalled();
        expect(context.sendMessage).toBeCalledWith(
          PAUSED_DEFAULT_MESSAGE,
          defaultReply
        );
      });
    });
  });
});
