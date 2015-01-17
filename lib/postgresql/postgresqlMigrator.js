'use strict';

var _ = require('underscore');
var pg = require('pg');
var help = require('../helpers');
var Promise = require('bluebird');
Promise.promisifyAll(pg);

/**
 * @class postgresql.PostgresqlMigrator
 * PostgresqlMigrator
 * 
 * @param {Object} config
 * @param {schema.SchemaAdapter} schemaAdapter
 * @param {postgresql.PostgresqlAdapter} adapter
 */
function PostgresqlMigrator(config, schemaAdapter, adapter) {
  this.config = config;
  this.schemaAdapter = schemaAdapter;
  this.adapter = adapter;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlMigrator.attachKey = 'postgresql.migrator';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {Promise|Object} The object with resolved dependencies
 */
PostgresqlMigrator.attach = function(app) {
  var config = app.config.postgresql;
  return Promise.join(
    app.get('schema.adapter'),
    app.get('postgresql.adapter')
  ).spread(function(schemaAdapter, adapter) {
    return new PostgresqlMigrator(config, schemaAdapter, adapter);
  });
};

/**
 * Create / migrate database.
 *
 * @param  {String} namespace
 * @param  {Number} version
 *
 * @return {Promise.<null>}
 */
PostgresqlMigrator.prototype.migrate = function(namespace, version) {
  var self = this;
  var opts = {
    namespace: namespace,
    version: version,
    database: namespace + 'v' + version,
    connectionString: 'postgresql://' + this.config.username + ':' + this.config.password + '@' + this.config.host + '/postgres'
  };

  var client = self.schemaAdapter.getClient(namespace);
  return client.getSnapshot(version)
    .then(function(schemas) {
      opts.schemas = schemas;
      return self._createDatabase(opts);
    })
    .then(function() {
      return self._getDatabaseClient(opts);
    })
    .then(function (client) {
      opts.client = client;
      return self._createTables(opts);
    });
};

PostgresqlMigrator.prototype._createDatabase = function(opts) {
  return pg.connectAsync(opts.connectionString)
    .spread(function(client, done) {
      return client.queryAsync('CREATE DATABASE ' + opts.database + ' TEMPLATE=template_postgis');
    })
    .then(function () {
    })
    .catch(function(err) {
      console.error('error while creating database', err);
    });
};

PostgresqlMigrator.prototype._getDatabaseClient = function(opts) {
  return this.adapter.getClient(opts.namespace, opts.version);
};

PostgresqlMigrator.prototype._createTables = function(opts) {
  var self = this;

  var promises = _.map(opts.schemas, function(schema, schemaKey) {
    return opts.client.schema.createTable(schema.table, function(table) {
      table.uuid('id').primary();
      table.integer('version');
      _.each(schema.columns, function(column, columnKey) {
        self['_define' + help.capitalizeFirstLetter(column.type)](table, column, columnKey);
      });
      table.specificType('links', 'uuid[]');
    })
    // triger knex.js's promise strategy
    .then(function() {
    }, function (err) {
      console.error('error while creating tables', err);
    });
  });

  return Promise.all(promises);
};

PostgresqlMigrator.prototype._defineInteger = function(table, column, columnKey) {
  table.integer(columnKey);
};

PostgresqlMigrator.prototype._defineUuid = function(table, column, columnKey) {
  table.uuid(columnKey);
};

PostgresqlMigrator.prototype._defineString = function(table, column, columnKey) {
  table.string(columnKey);
};

PostgresqlMigrator.prototype._defineText = function(table, column, columnKey) {
  table.text(columnKey);
};

PostgresqlMigrator.prototype._defineDatetime = function(table, column, columnKey) {
  table.dateTime(columnKey);
};

PostgresqlMigrator.prototype._defineDate = function(table, column, columnKey) {
  table.date(columnKey);
};

PostgresqlMigrator.prototype._defineFloat = function(table, column, columnKey) {
  table.float(columnKey);
};

PostgresqlMigrator.prototype._definePoint = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(Point,4326)');
};

PostgresqlMigrator.prototype._defineLinestring = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(LineString,4326)');
};

PostgresqlMigrator.prototype._defineRectangle = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(Polygon,4326)');
};

PostgresqlMigrator.prototype._defineBoolean = function(table, column, columnKey) {
  table.boolean(columnKey);
};

module.exports = PostgresqlMigrator;
