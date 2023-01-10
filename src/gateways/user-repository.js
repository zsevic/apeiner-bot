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
  getUserById,
  saveUser,
  setWalletAddress,
};
