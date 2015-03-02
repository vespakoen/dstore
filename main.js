'use strict';

var _ = require('underscore');
var App = require('./lib/app');
var initializer = require('./lib/initializer');
var projectApi = require('./lib/api/projectApi');
var blueprintApi = require('./lib/api/blueprintApi');
var storageApi = require('./lib/api/storageApi');

var schemas = [
  require('./schemas/geojson'),
  require('./schemas/types'),
  require('./schemas/item'),
  require('./schemas/blueprint')
];

module.exports = function (config) {
  var app = new App({
    config: config,
    schemas: schemas
  });

  if (_.contains(config.stores, 'elasticsearch')) {
    app.use(require('./lib/storage/elasticsearch/elasticsearchClient'));
    app.use(require('./lib/storage/elasticsearch/elasticsearchDropper'));
    app.use(require('./lib/storage/elasticsearch/elasticsearchFacade'));
    app.use(require('./lib/storage/elasticsearch/elasticsearchMigrator'));
    app.use(require('./lib/storage/elasticsearch/elasticsearchRepository'));
    app.use(require('./lib/storage/elasticsearch/elasticsearchSerializer'));
  }

  if (_.contains(config.stores, 'level')) {
    app.use(require('./lib/storage/level/levelAdapter'));
    app.use(require('./lib/storage/level/levelDropper'));
    app.use(require('./lib/storage/level/levelFacade'));
    app.use(require('./lib/storage/level/levelRepository'));
    app.use(require('./lib/storage/level/levelSerializer'));
  }

  if (_.contains(config.stores, 'postgresql')) {
    app.use(require('./lib/storage/postgresql/postgresqlAdapter'));
    app.use(require('./lib/storage/postgresql/postgresqlDropper'));
    app.use(require('./lib/storage/postgresql/postgresqlFacade'));
    app.use(require('./lib/storage/postgresql/postgresqlMigrator'));
    app.use(require('./lib/storage/postgresql/postgresqlRepository'));
    app.use(require('./lib/storage/postgresql/postgresqlSerializer'));
  }

  app.use(require('./lib/storage/itemTransformer'));
  app.use(require('./lib/storage/mock/mockFacade'));
  
  app.use(require('./lib/project/blueprint/blueprintFacade'));
  app.use(require('./lib/project/blueprint/blueprintService'));
  app.use(require('./lib/project/blueprint/blueprintDiffer'));
  app.use(require('./lib/project/client/projectClient'));
  app.use(require('./lib/project/client/mockProjectClient'));
  app.use(require('./lib/project/client/fileProjectClient'));
  app.use(require('./lib/project/client/levelProjectClient'));
  app.use(require('./lib/project/client/postgresqlProjectClient'));
  app.use(require('./lib/project/projectFacade'));
  app.use(require('./lib/project/projectService'));
  app.use(require('./lib/project/projectTagger'));

  app.use(require('./lib/queue/client/mockQueueClient'));
  app.use(require('./lib/queue/client/kueQueueClient'));
  app.use(require('./lib/queue/client/rabbitmqQueueClient'));
  
  app.use(require('./lib/queue'));
  app.use(require('./lib/validator'));
  app.use(require('./lib/poorMansSync'));

  app.init = function (cb) {
    return initializer(app)
      .then(function () {
        cb && cb(null, app);
      })
      .catch(function (err) {
        cb && cb(err);
      });
  };

  app.project = projectApi(app);
  app.blueprint = blueprintApi(app);
  app.storage = storageApi(app);

  return app;
};
