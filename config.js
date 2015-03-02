var _ = require('underscore');

module.exports = {
  stores: process.env.STORES ? process.env.STORES.split(',') : [
    'elasticsearch',
    'postgresql',
    'level'
  ],
  
  postgresql: {
    host: process.env.POSTGRESQL_HOST || 'localhost',
    port: process.env.POSTGRESQL_PORT || '5432',
    username: process.env.POSTGRESQL_USER || 'postgres',
    password: process.env.POSTGRESQL_PASSWORD || 'postgres'
  },

  elasticsearch: {
    hosts: [
      process.env.ELASTICSEARCH_HOST || 'http://localhost:9200'
    ]
  },

  level: {
    path: process.env.LEVEL_PATH || '/tmp'
  },

  queue: {
    client: process.env.QUEUE_CLIENT || 'kue',
    kue: {
      port: process.env.QUEUE_KUE_PORT || '3000'
    }
  },

  project: {
    client: process.env.PROJECT_CLIENT || 'file',
    file: {
      path: process.env.PROJECT_FILE_PATH || '/tmp/project'
    }
  }
};
