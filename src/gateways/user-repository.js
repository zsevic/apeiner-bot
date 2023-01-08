const database = require('../config/database-config');

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
  getUserById,
  saveUser,
};
