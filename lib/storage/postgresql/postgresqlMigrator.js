'use strict';

var _ = require('underscore');
var pg = require('pg');
var help = require('../../helpers');
var BBPromise = require('bluebird');
BBPromise.promisifyAll(pg);

/**
 * PostgresqlMigrator
 * 
 * @class storage.postgresql.PostgresqlMigrator
 * 
 * @param {Object} config
 * @param {storage.postgresql.PostgresqlAdapter} adapter
 */
function PostgresqlMigrator(config, adapter) {
  this.config = config;
  this.adapter = adapter;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
PostgresqlMigrator.attachKey = 'storage.postgresql.migrator';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A PostgresqlMigrator instance with resolved dependencies
 */
PostgresqlMigrator.attach = function(app) {
  var config = app.config.postgresql;
  return app.get('storage.postgresql.adapter')
    .then(function(adapter) {
      return new PostgresqlMigrator(config, adapter);
    });
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 *
 * @return {BBPromise.<undefined>}
 */
PostgresqlMigrator.prototype.migrate = function(projectId, projectVersion, blueprints) {
  var self = this;
  var opts = {
    projectId: projectId,
    projectVersion: projectVersion,
    connectionString: 'postgresql://' + this.config.username + ':' + this.config.password + '@' + this.config.host + '/postgres',
    blueprints: blueprints
  };

  return self._getConnection(opts)
    .then(function (managementClient) {
      opts.managementClient = managementClient;
      return self._createDatabase(opts)
        .then(function () {
          return self._getDatabaseClient(opts);
        })
        .then(function (client) {
          opts.client = client;
          return self._createTables(opts);
        });
    });
};

PostgresqlMigrator.prototype._getConnection = function (opts) {
  var self = this;
  return pg.connectAsync(opts.connectionString)
    .spread(function(client, done) {
      self.connectionCloser = done;
      return client;
    });
};

PostgresqlMigrator.prototype.closeConnection = function () {
  if (this.connectionCloser) {
    this.connectionCloser();
  }
};

/**
 * Creates a new database for given projectId and project version.
 * 
 * @param  {Object} opts                  Options for creating the DATABASE
 * @param  {String} opts.connectionString The postgresql connectionstring
 * @param  {String} opts.projectId        The project's identifier
 * @param  {Number} opts.projectVersion   The project version
 */
PostgresqlMigrator.prototype._createDatabase = function(opts) {
  var self = this;
  return opts.managementClient.queryAsync('CREATE DATABASE ' + opts.projectId + 'v' + opts.projectVersion + ' TEMPLATE=template_postgis')
    .then(function () {
      self.connectionCloser();
    })
    .catch(function (err) {
      console.error('Error while creating database', err);
      throw err;
    });
};

/**
 * Retrieves the database client for given projectId and project version.
 * 
 * @param  {Object} opts                    Options for retrieving the database
 * @param  {String} opts.projectId          The project's identifier
 * @param  {Number} opts.projectVersion     The project version
 */
PostgresqlMigrator.prototype._getDatabaseClient = function(opts) {
  return this.adapter.getClient(opts.projectId, opts.projectVersion);
};

/**
 * Creates tables in database based on the given blueprints.
 * 
 * @param  {Object}                                 opts            Options for creating the tables
 * @param  {storage.postgresql.PostgresqlClient}  opts.client     The project's identifier
 * @param  {Object}                                 opts.blueprints The blueprints
 */
PostgresqlMigrator.prototype._createTables = function(opts) {
  var self = this;

  var promises = _.map(opts.blueprints, function(blueprint, blueprintId) {
    return opts.client.schema.createTable(blueprint.postgresql.table, function(table) {
      table.uuid('id').primary();
      table.integer('project_version');
      _.each(blueprint.columns, function(column, columnKey) {
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
