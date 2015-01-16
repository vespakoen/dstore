'use strict';

var App = require('./lib/app');

var environment = process.env.ENV;
var config = require('./config/' + environment.toLowerCase());

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

