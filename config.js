module.exports = {
  stores: [
    'postgresql',
    'elasticsearch',
    'level'
  ],
  
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

  level: {
    path: process.env.LEVEL_PATH
  },

  queue: {
    connectionString: process.env.QUEUE_CONNECTIONSTRING
  },

  project: {
    client: 'file',
    file: {
      path: process.env.PROJECT_FILE_PATH
    }
  }
};
