'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');

/**
 * MockFacade
 *
 * @class storage.mock.MockFacade
 */
function MockFacade() {
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
MockFacade.attachKey = 'storage.mock.facade';

/**
 * IOC attach.
 *
 * @param {App} app
 * @return {BBPromise} A MockFacade instance with resolved dependencies
 */
MockFacade.attach = function(app) {
  return BBPromise.resolve(new MockFacade());
};

/**
 * Insert / update item
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {String} id
 * @param  {Object} item
 *
 * @return {BBPromise}
 */
MockFacade.prototype.putItem = function(projectId, blueprintId, id, item) {
  return BBPromise.resolve();
};

/**
 * Delete item
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {String} id
 *
 * @return {BBPromise}
 */
MockFacade.prototype.delItem = function(projectId, blueprintId, id) {
  return BBPromise.resolve();
};

/**
 * Create / migrate database.
 *
 * @param  {String} projectId
 * @param  {Number} projectVersion
 * @param  {Object} blueprints
 *
 * @return {BBPromise.<undefined>}
 */
MockFacade.prototype.migrate = function(projectId, projectVersion, blueprints) {
  return BBPromise.resolve();
};

/**
 * Drop all databases of a project.
 * 
 * @return {BBPromise}
 */
MockFacade.prototype.drop = function(projectId) {
  return BBPromise.resolve(true);
};

/**
 * Serialize an item to make it compatible with mock.
 *
 * @param  {String} projectId
 * @param  {String} blueprintId
 * @param  {Object} item
 * @return {Object} The serialized item
 */
MockFacade.prototype.serialize = function(projectId, blueprintId, item) {
  return item;
};

module.exports = MockFacade;
