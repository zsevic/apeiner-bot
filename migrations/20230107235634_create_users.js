/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.string('id').notNullable();
    table.string('username', 255).notNullable();
    table.string('wallet_address').nullable();
    table.boolean('is_subscribed').defaultTo(false);
    table.boolean('is_active').defaultTo(false);
    table.boolean('is_trial_active').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
