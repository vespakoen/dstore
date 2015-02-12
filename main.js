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
if ( ! _.isString(process.env.BLUEPRINT_PATH))          throw new Error('The BLUEPRINT_PATH environment variable is not defined!');
if ( ! _.isString(process.env.PORT))                    throw new Error('The PORT environment variable is not defined!');

var config = require('./config');

var schemas = [
  require('./schemas/geojson'),
  require('./schemas/types'),
  require('./schemas/item'),
  require('./schemas/blueprint')
];

var app = new App({
  config: config,
  schemas: schemas
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

app.use(require('./lib/blueprint/client/fileBlueprintClient'));
app.use(require('./lib/blueprint/blueprintAdapter'));
app.use(require('./lib/blueprint/blueprintDiffer'));
app.use(require('./lib/blueprint/blueprintFacade'));
app.use(require('./lib/blueprint/blueprintService'));
app.use(require('./lib/blueprint/blueprintSnapshotter'));

app.use(require('./lib/item/itemTransformer'));

app.use(require('./lib/queue'));
app.use(require('./lib/validator'));

module.exports = app;
