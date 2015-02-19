#!/bin/sh

pm2 start $PROJECTOR_PATH/bin/queueToQueue.js
pm2 start $PROJECTOR_PATH/bin/queueToProject.js
pm2 start $PROJECTOR_PATH/bin/queueToBlueprint.js
pm2 start $PROJECTOR_PATH/bin/queueToLevel.js
pm2 start $PROJECTOR_PATH/bin/queueToElasticsearch.js
pm2 start $PROJECTOR_PATH/bin/queueToPostgresql.js
pm2 start $PROJECTOR_PATH/bin/startApi.js
