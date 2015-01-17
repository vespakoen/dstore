'use strict';

var _ = require('underscore');
var App = require('./lib/app');

if ( ! _.isString(process.env.POSTGRESQL_HOST))         throw new Error('The POSTGRESQL_HOST environment variable is not defined!');
if ( ! _.isString(process.env.POSTGRESQL_PORT))         throw new Error('The POSTGRESQL_PORT environment variable is not defined!');
if ( ! _.isString(process.env.POSTGRESQL_USER))         throw new Error('The POSTGRESQL_USER environment variable is not defined!');
if ( ! _.isString(process.env.POSTGRESQL_PASSWORD))     throw new Error('The POSTGRESQL_PASSWORD environment variable is not defined!');
if ( ! _.isString(process.env.ELASTICSEARCH_HOST))      throw new Error('The ELASTICSEARCH_HOST environment variable is not defined!');
if ( ! _.isString(process.env.QUEUE_CONNECTIONSTRING))  throw new Error('The QUEUE_CONNECTIONSTRING environment variable is not defined!');
if ( ! _.isString(process.env.LEVEL_PATH))              throw new Error('The LEVEL_PATH environment variable is not defined!');
if ( ! _.isString(process.env.SCHEMA_PATH))             throw new Error('The SCHEMA_PATH environment variable is not defined!');

var config = require('./config');

var app = new App({
  config: config
});

app.use(require('./lib/elasticsearch/elasticsearchClient'));
app.use(require('./lib/elasticsearch/elasticsearchFacade'));
app.use(require('./lib/elasticsearch/elasticsearchMigrator'));
app.use(require('./lib/elasticsearch/elasticsearchRepository'));
app.use(require('./lib/elasticsearch/elasticsearchSerializer'));

app.use(require('./lib/level/levelAdapter'));
app.use(require('./lib/level/levelFacade'));
app.use(require('./lib/level/levelRepository'));
app.use(require('./lib/level/levelSerializer'));

app.use(require('./lib/postgresql/postgresqlAdapter'));
app.use(require('./lib/postgresql/postgresqlFacade'));
app.use(require('./lib/postgresql/postgresqlMigrator'));
app.use(require('./lib/postgresql/postgresqlRepository'));
app.use(require('./lib/postgresql/postgresqlSerializer'));

app.use(require('./lib/schema/client/fileSchemaClient'));
app.use(require('./lib/schema/schemaAdapter'));
app.use(require('./lib/schema/schemaDiffer'));
app.use(require('./lib/schema/schemaFacade'));
app.use(require('./lib/schema/schemaService'));
app.use(require('./lib/schema/schemaSnapshotter'));

app.use(require('./lib/item/itemTransformer'));

app.use(require('./lib/queue'));

module.exports = app;

