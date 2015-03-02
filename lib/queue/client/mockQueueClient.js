'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var help = require('../../helpers');

/**
 * An in-memory queue driver wrapped in promises.
 *
 * @class MockQueueClient
 * @param {Object} context the rabbit.js context
 */
function MockQueueClient(context) {
  this.handlers = {};
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
MockQueueClient.attachKey = 'queue.client.mock';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
var queue = BBPromise.resolve(new MockQueueClient());
MockQueueClient.attach = function(app) {
  return queue;
};

/**
 * Setup the publisher.
 *
 * @return {BBPromise.<MockQueueClient>}
 */
MockQueueClient.prototype.setupPublisher = function() {
  return BBPromise.resolve(this);
};

/**
 * Setup the consumer.
 *
 * @return {BBPromise.<MockQueueClient>}
 */
MockQueueClient.prototype.setupConsumer = function() {
  return BBPromise.resolve(this);
};

/**
 * Publish a message to the queue.
 *
 * @param  {String} key
 * @param  {Object} body
 *
 * @return {BBPromise.<undefined|Error>}
 */
MockQueueClient.prototype.publish = function(key, body) {
  var handler = this.handlers[key];
  
  if (handler) {
    if (handler.serial) {
      handler.chain = handler.chain.then(function () {
        return handler.callback(body);
      });
      return handler.chain;
    }
    
    return handler.callback(body);
  }
};

/**
 * Consume messages from the queue.
 *
 * @param  {String} key
 * @param  {Function} cb
 *
 * @return {BBPromise.<undefined>}
 */
MockQueueClient.prototype.consume = function(key, cb, serial) {
  this.handlers[key] = {
    callback: cb,
    serial: serial,
    chain: BBPromise.resolve()
  };
};

module.exports = MockQueueClient;
