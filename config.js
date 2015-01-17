module.exports = {
  postgresql: {
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD
  },

  elasticsearch: {
    hosts: [
      process.env.ELASTICSEARCH_HOST
    ]
  },

  queue: {
    connectionString: process.env.QUEUE_CONNECTIONSTRING
  },

  level: {
    path: process.env.LEVEL_PATH
  },

  schema: {
    path: process.env.SCHEMA_PATH
  }
};
