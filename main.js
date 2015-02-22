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
if ( ! _.isString(process.env.PROJECT_FILE_PATH))       throw new Error('The PROJECT_FILE_PATH environment variable is not defined!');
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

app.use(require('./lib/storage/itemTransformer'));

app.use(require('./lib/storage/elasticsearch/elasticsearchClient'));
app.use(require('./lib/storage/elasticsearch/elasticsearchDropper'));
app.use(require('./lib/storage/elasticsearch/elasticsearchFacade'));
app.use(require('./lib/storage/elasticsearch/elasticsearchMigrator'));
app.use(require('./lib/storage/elasticsearch/elasticsearchRepository'));
app.use(require('./lib/storage/elasticsearch/elasticsearchSerializer'));

app.use(require('./lib/storage/level/levelAdapter'));
app.use(require('./lib/storage/level/levelFacade'));
app.use(require('./lib/storage/level/levelRepository'));
app.use(require('./lib/storage/level/levelSerializer'));

app.use(require('./lib/storage/postgresql/postgresqlAdapter'));
app.use(require('./lib/storage/postgresql/postgresqlDropper'));
app.use(require('./lib/storage/postgresql/postgresqlFacade'));
app.use(require('./lib/storage/postgresql/postgresqlMigrator'));
app.use(require('./lib/storage/postgresql/postgresqlRepository'));
app.use(require('./lib/storage/postgresql/postgresqlSerializer'));

app.use(require('./lib/project/blueprint/blueprintFacade'));
app.use(require('./lib/project/blueprint/blueprintService'));
app.use(require('./lib/project/blueprint/blueprintDiffer'));
app.use(require('./lib/project/client/projectClient'));
app.use(require('./lib/project/client/fileProjectClient'));
app.use(require('./lib/project/client/levelProjectClient'));
app.use(require('./lib/project/client/postgresqlProjectClient'));
app.use(require('./lib/project/projectFacade'));
app.use(require('./lib/project/projectService'));
app.use(require('./lib/project/projectTagger'));


app.use(require('./lib/queue'));
app.use(require('./lib/validator'));

module.exports = app;
