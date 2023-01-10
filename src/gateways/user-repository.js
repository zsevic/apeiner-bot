const database = require('../config/database-config');

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

module.exports = {
  activateTrial,
  deactivateTrial,
  getUserById,
  saveUser,
};
