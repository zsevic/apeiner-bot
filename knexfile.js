require('dotenv/config');
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  dev: {
    client: 'postgresql',
    connection: {
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOSTNAME,
      port: process.env.DATABASE_PORT,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    useNullAsDefault: true,
  },

  test: {
    client: 'postgresql',
    connection: {
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOSTNAME,
      port: process.env.DATABASE_PORT,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'postgresql',
    connection: {
      uri: process.env.DATABASE_URL,
    },
    pool: {
      min: 1,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
