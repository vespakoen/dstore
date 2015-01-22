'use strict';

var _ = require('underscore');
var pg = require('pg');
var help = require('../helpers');
var BBPromise = require('bluebird');
BBPromise.promisifyAll(pg);

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
 * @return {BBPromise} A PostgresqlMigrator instance with resolved dependencies
 */
PostgresqlMigrator.attach = function(app) {
  var config = app.config.postgresql;
  return BBPromise.join(
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
 * @param  {Number} snapshotVersion
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlMigrator.prototype.migrate = function(namespace, snapshotVersion) {
  var self = this;
  var opts = {
    namespace: namespace,
    snapshotVersion: snapshotVersion,
    connectionString: 'postgresql://' + this.config.username + ':' + this.config.password + '@' + this.config.host + '/postgres'
  };

  var client = self.schemaAdapter.getClient(namespace);
  return client.getSnapshot(snapshotVersion)
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

/**
 * Creates a new database for given namespace and snapshot version.
 * 
 * @param  {Object} opts                  Options for creating the DATABASE
 * @param  {String} opts.connectionString The postgresql connectionstring
 * @param  {String} opts.namespace        The project namespace
 * @param  {Number} opts.snapshotVersion  The snapshot version
 */
PostgresqlMigrator.prototype._createDatabase = function(opts) {
  return pg.connectAsync(opts.connectionString)
    .spread(function(client, done) {
      return client.queryAsync('CREATE DATABASE ' + opts.namespace + 'v' + opts.snapshotVersion + ' TEMPLATE=template_postgis');
    })
    .catch(function(err) {
      console.error('error while creating database', err);
    });
};

/**
 * Retrieves the database client for given namespace and snapshot version.
 * 
 * @param  {Object} opts                    Options for retrieving the database
 * @param  {String} opts.namespace          The project namespace
 * @param  {Number} opts.snapshotVersion    The snapshot version
 */
PostgresqlMigrator.prototype._getDatabaseClient = function(opts) {
  return this.adapter.getClient(opts.namespace, opts.snapshotVersion);
};

/**
 * Creates tables in database based on the given schemas.
 * 
 * @param  {Object}                      opts         Options for creating the tables
 * @param  {postgresql.PostgresqlClient} opts.client  The project namespace
 * @param  {Object}                      opts.schemas The schemas
 */
PostgresqlMigrator.prototype._createTables = function(opts) {
  var self = this;

  var promises = _.map(opts.schemas, function(schema, schemaKey) {
    return opts.client.schema.createTable(schema.table, function(table) {
      table.uuid('id').primary();
      table.integer('snapshot_version');
      _.each(schema.columns, function(column, columnKey) {
        self['_define' + help.capitalizeFirstLetter(column.type).replace('[]', 'Array')](table, column, columnKey);
      });
      table.specificType('links', 'uuid[]');
    })
    // triger knex.js's promise strategy
    .then(function() {
    }, function (err) {
      console.error('error while creating tables', err);
    });
  });

  return BBPromise.all(promises);
};

/**
 * Defines an INTEGER column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineInteger = function(table, column, columnKey) {
  table.integer(columnKey);
};

/**
 * Defines an INTEGER[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineIntegerArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'INTEGER[]');
};

/**
 * Defines an UUID column on given table.
 * 
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineUuid = function(table, column, columnKey) {
  table.uuid(columnKey);
};

/**
 * Defines an UUID[] column on given table.
 * 
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineUuidArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'UUID[]');
};

/**
 * Defines an STRING column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineString = function(table, column, columnKey) {
  table.string(columnKey);
};

/**
 * Defines an STRING[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineStringArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'VARCHAR[]');
};

/**
 * Defines an TEXT column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineText = function(table, column, columnKey) {
  table.text(columnKey);
};

/**
 * Defines an TEXT[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineTextArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'TEXT[]');
};

/**
 * Defines an DATETIME column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineDatetime = function(table, column, columnKey) {
  table.dateTime(columnKey);
};

/**
 * Defines an DATETIME[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineDatetimeArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'TIMESTAMP WITH TIME ZONE[]');
};

/**
 * Defines an DATE column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineDate = function(table, column, columnKey) {
  table.date(columnKey);
};

/**
 * Defines an DATE[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineDateArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'DATE[]');
};

/**
 * Defines an REAL column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineFloat = function(table, column, columnKey) {
  table.float(columnKey);
};

/**
 * Defines an REAL[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineFloatArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'REAL[]');
};

/**
 * Defines an GEOMETRY column of type Point on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._definePoint = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(Point,4326)');
};

/**
 * Defines an GEOMETRY column of type MultiPoint on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._definePointArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(MultiPoint,4326)');
};

/**
 * Defines an GEOMETRY column of type LineString on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineLinestring = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(LineString,4326)');
};

/**
 * Defines an GEOMETRY column of type MultiLineString on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineLinestringArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(MultiLineString,4326)');
};

/**
 * Defines an GEOMETRY column of type Polygon on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._definePolygon = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(Polygon,4326)');
};

/**
 * Defines an GEOMETRY column of type MultiPolygon on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._definePolygonArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'geometry(MultiPolygon,4326)');
};

/**
 * Defines an BOOLEAN column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineBoolean = function(table, column, columnKey) {
  table.boolean(columnKey);
};

/**
 * Defines an BOOLEAN[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineBooleanArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'BOOLEAN[]');
};

/**
 * Defines a JSON column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineJson = function(table, column, columnKey) {
  table.json(columnKey);
};

/**
 * Defines a JSON[] column on given table.
 *
 * @protected
 * @param  {Object} table     Knex.js table object (given through createTable's callback)
 * @param  {Object} column    Column definition
 * @param  {String} columnKey Name of the column
 */
PostgresqlMigrator.prototype._defineJsonArray = function(table, column, columnKey) {
  table.specificType(columnKey, 'JSON[]');
};

module.exports = PostgresqlMigrator;
