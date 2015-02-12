#!/bin/sh

pm2 kill
pm2 start bin/queueToQueue.js
pm2 start bin/queueToBlueprint.js
pm2 start bin/queueToLevel.js
pm2 start bin/queueToElasticsearch.js
pm2 start bin/queueToPostgresql.js
pm2 start bin/startApi.js
pm2 flush
