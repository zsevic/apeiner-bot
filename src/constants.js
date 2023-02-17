const COLLECTIONS_TO_ANALYZE = 7;
const ETH = 'ETH';
const WETH = 'WETH';
const MIN_TOTAL_SUPPLY = 1000;
const MAX_TOTAL_SUPPLY = 10005;
const MIN_FLOOR_PRICE = 0.01;
const MIN_VOLUME = 20;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const PROTOCOLS = ['ERC721', 'ERC1155'];
const DATETIME_FORMAT = 'en-GB';
const TIMEZONE = 'Europe/Belgrade';

const CHAT_ID = 1618850255;

const PAUSED_DEFAULT_MESSAGE = `Apeiner is paused, if you want to activate it, reply with /activate message`;
const ACTIVATED_DEFAULT_MESSAGE = `Apeiner is activated, if you want to pause it, reply with /pause message`;
const ACTIVATION_IN_PROGRESS_MESSAGE = `Apeiner will be activated once we verify the whole registration process\n\nYou can update the wallet address by sending the message in the following format: \n/update [YOUR WALLET ADDRESS]`;
const ACTIVATION_MESSAGE =
  'In order to activate apeiner, send 0.05ETH to apeiner.eth\n\nAfter you complete the first step, send the message in the following format: \n/activate [YOUR WALLET ADDRESS]\n\nfor example: /activate 0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const INVALID_WALLET_MESSAGE = 'Wallet address is not valid, please try again';
const SETTING_WALLET_ADDRESS_FEEDBACK_MESSAGE = `Thanks for setting the wallet address, Apeiner will be activated once we verify the whole registration process`;

const headers = {
  accept: '*/*',
  'content-type': 'application/json',
  'x-build-id': '7c4e8c11cb0844796e38aa3cf13f29e1221267b3',
};
const OPENSEA_API_BASE_URL = 'https://opensea.io/__api/graphql/';
const COLLECTION_RETRIEVAL_COUNTER = 32;

const replyMarkup = {
  keyboard: [
    [
      {
        text: '/1',
      },
      {
        text: '/2',
      },
      {
        text: '/3',
      },
      {
        text: '/5',
      },
      {
        text: '/10',
      },
    ],
  ],
};

const userReplyMarkup = {
  keyboard: [
    [
      {
        text: '/pause',
      },
    ],
  ],
};

const defaultAdminReply = {
  parseMode: 'HTML',
  replyMarkup,
};

const defaultUserReply = {
  parseMode: 'HTML',
  replyMarkup: userReplyMarkup,
};

const defaultReply = {
  parseMode: 'HTML',
};

module.exports = {
  ACTIVATED_DEFAULT_MESSAGE,
  ACTIVATION_IN_PROGRESS_MESSAGE,
  ACTIVATION_MESSAGE,
  CHAT_ID,
  COLLECTIONS_TO_ANALYZE,
  COLLECTION_RETRIEVAL_COUNTER,
  DATETIME_FORMAT,
  defaultReply,
  defaultAdminReply,
  defaultUserReply,
  ETH,
  WETH,
  headers,
  INVALID_WALLET_MESSAGE,
  MAX_TOTAL_SUPPLY,
  MIN_FLOOR_PRICE,
  MIN_TOTAL_SUPPLY,
  MIN_VOLUME,
  NULL_ADDRESS,
  OPENSEA_API_BASE_URL,
  PAUSED_DEFAULT_MESSAGE,
  PROTOCOLS,
  replyMarkup,
  SETTING_WALLET_ADDRESS_FEEDBACK_MESSAGE,
  userReplyMarkup,
  TIMEZONE,
};
