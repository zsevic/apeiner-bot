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
  getUserById,
  getUserByWalletAddress,
  saveUser,
  setWalletAddress,
  subscribe,
};
