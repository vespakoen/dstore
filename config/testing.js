module.exports = {
  postgresql: {
    host: process.env.POSTGRESQL_HOST || 'localhost',
    username: process.env.POSTGRESQL_USER || 'trapps',
    password: process.env.POSTGRESQL_PASSWORD || 'trapps'
  },

  elasticsearch: {
    hosts: [
      process.env.ELASTICSEARCH_HOST || 'http://localhost:9200' //'http://search.trapps.nl:80'
    ]
  },

  queue: {
    connectionString: process.env.QUEUE_CONNECTIONSTRING || 'amqp://localhost'
  },

  level: {
    path: process.env.LEVEL_PATH || __dirname + '/../tests/out/level',
  },

  schema: {
    path: process.env.SCHEMA_PATH || __dirname + '/../tests/out/schema'
  },

  project: {
    contentTypeKey: process.env.PROJECT_CONTENTTYPEKEY || 'app',
    indexKey: process.env.PROJECT_INDEXKEY || 'namespace'
  }
};
