'use strict';

var _ = require('underscore');
var rabbit = require('rabbit.js');
var BBPromise = require('bluebird');
var help = require('../../helpers');

/**
 * A RabbitMQ queue driver wrapped in promises.
 *
 * @class RabbitmqQueueClient
 * @param {Object} context the rabbit.js context
 */
function RabbitmqQueueClient(context) {
  this.context = context;
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
RabbitmqQueueClient.attachKey = 'queue.client.rabbitmq';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
var queue;
RabbitmqQueueClient.attach = function(app) {
  var connectionString = app.config.queue.connectionString;
  if ( ! queue) {
    queue = new BBPromise(function (resolve, reject) {
      var context = rabbit.createContext(connectionString);
      context.on('ready', function() {
        resolve(new RabbitmqQueueClient(context));
      });
      context.on('error', function (err) {
        console.error('Could not connect to RabbitMQ');
        throw err;
      });
    });
  }
  return queue;
};

/**
 * Setup the publisher.
 *
 * @return {BBPromise.<RabbitmqQueueClient>}
 */
RabbitmqQueueClient.prototype.setupPublisher = function() {
  return BBPromise.resolve(this);
};

/**
 * Setup the consumer.
 *
 * @return {BBPromise.<RabbitmqQueueClient>}
 */
RabbitmqQueueClient.prototype.setupConsumer = function() {
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
RabbitmqQueueClient.prototype.publish = function(key, body) {
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
 * @return {BBPromise.<undefined>}
 */
RabbitmqQueueClient.prototype.consume = function(key, cb, serial) {
  var self = this;
  return new BBPromise(function(resolve, reject) {
    var reply = self.context.socket('REP');
    reply.connect(key, function () {
      reply.pipe(es.through(function (data) {
        var self = this;
        data = JSON.parse(data.toString());

        // if we consume this serially, pause the stream
        if (serial) {
          this.pause();
        }
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
            })
            .finally(function () {
              // if we consume this serially, resume the stream
              if (serial) {
                self.resume();
              }
            });
        }
      }));
      resolve();
    });
  });
};

/**
 * Closes the queue connection
 */
RabbitmqQueueClient.prototype.close = function(cb) {
  this.context.close(cb);
};

module.exports = RabbitmqQueueClient;
