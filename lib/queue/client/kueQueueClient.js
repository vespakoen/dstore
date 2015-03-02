'use strict';

var _ = require('underscore');
var BBPromise = require('bluebird');
var help = require('../../helpers');
var kue = require('kue');
var jobs = kue.createQueue();

/**
 * A Kue queue driver wrapped in promises.
 *
 * @class queue.client.KueQueueClient
 */
function KueQueueClient() {
}

/**
 * IOC attachKey.
 *
 * @type {String}
 */
KueQueueClient.attachKey = 'queue.client.kue';

/**
 * IOC attach.
 *
 * @param {App} app
 *
 * @return {BBPromise|Object} The object with resolved dependencies
 */
var queue = BBPromise.resolve(new KueQueueClient());
KueQueueClient.attach = function(app) {
  return queue;
};

/**
 * Setup the publisher.
 *
 * @return {BBPromise.<KueQueueClient>}
 */
KueQueueClient.prototype.setupPublisher = function() {
  return BBPromise.resolve(this);
};

/**
 * Setup the consumer.
 *
 * @return {BBPromise.<KueQueueClient>}
 */
KueQueueClient.prototype.setupConsumer = function() {
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
KueQueueClient.prototype.publish = function(key, body) {
  return new BBPromise(function (resolve, reject) {
    var job = jobs.create(key, {
      title: JSON.stringify(body),
      body: body
    })
    .save(function (err) {
      if (err) console.error('Error while queing job', err);
    });

    job
      .on('complete', function (result) {
        resolve(result);
      })
      .on('failed', function (err) {
        var unserializedError = help.unserializeError(JSON.parse(err));
        reject(unserializedError);
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
KueQueueClient.prototype.consume = function(key, cb, serial) {
  jobs.process(key, function (job, done) {
    cb(job.data.body)
      .then(function (result) {
        done(null, result);
      })
      .catch(function (err) {
        var stringifiedError = JSON.stringify(help.serializeError(err));
        done(new Error(stringifiedError));
      });
  });
};

module.exports = KueQueueClient;
