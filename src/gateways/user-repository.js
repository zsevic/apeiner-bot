const database = require('../config/database-config');

/**
 *
 * @param {number} userId
 */
const activate = async (userId) =>
  database('users').where('id', userId).update({ is_active: true });

/**
 *
 * @param {number} userId
 */
const pause = async (userId) =>
  database('users').where('id', userId).update({ is_active: false });

/**
 *
 * @param {string} wallet
 */
const subscribe = async (walletAddress) =>
  database('users')
    .where('wallet_address', walletAddress)
    .update({ is_subscribed: true, is_active: true });

/**
 *
 * @returns {number}
 */
const getNumberOfUsers = async () => {
  const result = await database('users').count('id').first();
  return result.count;
};

/**
 *
 * @returns {number}
 */
const getNumberOfSubscribedUsers = async () => {
  const result = await database('users')
    .count('id')
    .where({ is_subscribed: true })
    .first();
  return result.count;
};

/**
 *
 * @param {number} id
 * @param {string} walletAddress
 * @returns {boolean}
 */
const isWalletAddressAlreadyUsed = async (id, walletAddress) => {
  const result = await database('users')
    .whereNot({ id })
    .andWhere({ wallet_address: walletAddress });
  return !!result.length;
};

/**
 *
 * @returns {number}
 */
const getNumberOfActiveUsers = async () => {
  const result = await database('users')
    .count('id')
    .where({ is_active: true })
    .first();
  return result.count;
};

/**
 *
 * @param {number} userId
 */
const activateTrial = async (userId) =>
  database('users').where('id', userId).update({ is_trial_active: true });

/**
 *
 * @param {number} userId
 */
const deactivateTrial = async (userId) =>
  database('users').where('id', userId).update({ is_trial_active: false });

/**
 *
 * @param {number} id
 */
const getUserById = async (id) => {
  const users = await database('users').where('id', id);
  return users[0];
};

/**
 *
 * @param {string} walletAddress
 */
const getUserByWalletAddress = async (walletAddress) => {
  const users = await database('users').where('wallet_address', walletAddress);
  return users[0];
};

/**
 * @returns {Promise<string[]>}
 */
const getSubscribedUserIds = async () => {
  const users = await database('users').select('id').where({
    is_subscribed: true,
    is_active: true,
  });
  return users.map((user) => user.id);
};

/**
 *
 * @param {User} user
 */
const saveUser = async (user) => database('users').insert(user);

/**
 *
 * @param {number} userId
 * @param {string} walletAddress
 */
const setWalletAddress = async (userId, walletAddress) =>
  database('users')
    .where('id', userId)
    .update({ wallet_address: walletAddress });

module.exports = {
  activate,
  pause,
  activateTrial,
  deactivateTrial,
  getNumberOfUsers,
  getNumberOfActiveUsers,
  getNumberOfSubscribedUsers,
  getSubscribedUserIds,
  getUserById,
  getUserByWalletAddress,
  isWalletAddressAlreadyUsed,
  saveUser,
  setWalletAddress,
  subscribe,
};
