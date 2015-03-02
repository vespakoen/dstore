var _ = require('underscore');

if ( ! _.isString(process.env.POSTGRESQL_HOST))         throw new Error('The POSTGRESQL_HOST environment variable is not defined!');
if ( ! _.isString(process.env.POSTGRESQL_PORT))         throw new Error('The POSTGRESQL_PORT environment variable is not defined!');
if ( ! _.isString(process.env.POSTGRESQL_USER))         throw new Error('The POSTGRESQL_USER environment variable is not defined!');
if ( ! _.isString(process.env.POSTGRESQL_PASSWORD))     throw new Error('The POSTGRESQL_PASSWORD environment variable is not defined!');
if ( ! _.isString(process.env.ELASTICSEARCH_HOST))      throw new Error('The ELASTICSEARCH_HOST environment variable is not defined!');
if ( ! _.isString(process.env.QUEUE_CONNECTIONSTRING))  throw new Error('The QUEUE_CONNECTIONSTRING environment variable is not defined!');
if ( ! _.isString(process.env.LEVEL_PATH))              throw new Error('The LEVEL_PATH environment variable is not defined!');
if ( ! _.isString(process.env.PROJECT_FILE_PATH))       throw new Error('The PROJECT_FILE_PATH environment variable is not defined!');
if ( ! _.isString(process.env.PORT))                    throw new Error('The PORT environment variable is not defined!');

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
    path: process.env.LEVEL_PATH || '/tmp/'
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
      path: process.env.PROJECT_FILE_PATH
    }
  }
};
