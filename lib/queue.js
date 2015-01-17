'use strict';

var _ = require('underscore');
var request = require('request');
var rabbit = require('rabbit.js');
var BBPromise = require('bluebird');;
var help = require('./helpers');

/**
 * A RabbitMQ queue driver wrapped in promises.
 *
 * @class Queue
 * @param {Object} context the rabbit.js context
 */
function Queue(context) {
  this.context = context;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
Queue.attachKey = 'queue';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {Promise|Object} The object with resolved dependencies
 */
Queue.attach = function(app) {
  var connectionString = app.config.queue.connectionString;
  return new BBPromise(function(resolve, reject) {
    var context = rabbit.createContext(connectionString);
    context.on('ready', function() {
      resolve(new Queue(context));
    });
  });
};

/**
 * Setup the publisher.
 *
 * @return {BBPromise.<Queue>}
 */
Queue.prototype.setupPublisher = function() {
  return BBPromise.resolve(this);
};

/**
 * Setup the consumer.
 *
 * @return {BBPromise.<Queue>}
 */
Queue.prototype.setupConsumer = function() {
  return BBPromise.resolve(this);
};

/**
 * Publish a message to the queue.
 *
 * @param  {String} key
 * @param  {Object} body
 *
 * @return {BBPromise.<null|Error>}
 */
Queue.prototype.publish = function(key, body) {
  var self = this;
  return new BBPromise(function(resolve, reject) {
    var request = self.context.socket('REQ');
    request.connect(key, function () {
      var message = JSON.stringify({
        type: key,
        body: body
      });
      request.write(message, 'utf8');
      request.on('data', function (buffer) {
        var data = JSON.parse(buffer.toString());
        if (data.status === 'error') {
          return reject(help.unserializeError(data.err));
        }
        resolve(data.result);
      });
    });
  });
};

/**
 * Consume messages from the queue.
 *
 * @param  {String} key
 * @param  {Function} cb
 *
 * @return {BBPromise.<null>}
 */
Queue.prototype.consume = function(key, cb) {
  var self = this;
  return new BBPromise(function(resolve, reject) {
    var reply = self.context.socket('REP');
    reply.connect(key, function () {
      reply.on('data', function (buffer) {
        var data = JSON.parse(buffer.toString());
        if (data.type === key || key === '#') {
          cb(data.body)
            .then(function (result) {
              reply.write(JSON.stringify({
                status: 'complete',
                result: result
              }), 'utf8');
            }, function (err) {
              reply.write(JSON.stringify({
                status: 'error',
                err: help.serializeError(err)
              }), 'utf8');
            });
        }
      });
      resolve();
    });
  });
};

module.exports = Queue;
