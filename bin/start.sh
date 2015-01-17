#!/bin/sh

pm2 kill
pm2 start queueToQueue.js
pm2 start queueToSchema.js
pm2 start queueToLevel.js
pm2 start queueToElasticsearch.js
pm2 start queueToPostgresql.js
pm2 start startApi.js
pm2 flush
pm2 logs
