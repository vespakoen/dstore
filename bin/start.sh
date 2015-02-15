#!/bin/sh

pm2 start /opt/node-projector/bin/queueToQueue.js
pm2 start /opt/node-projector/bin/queueToBlueprint.js
pm2 start /opt/node-projector/bin/queueToLevel.js
pm2 start /opt/node-projector/bin/queueToElasticsearch.js
pm2 start /opt/node-projector/bin/queueToPostgresql.js
pm2 start /opt/node-projector/bin/startApi.js
