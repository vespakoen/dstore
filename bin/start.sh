#!/bin/sh

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

pm2 kill
pm2 start $DIR/queueToQueue.js
pm2 start $DIR/queueToSchema.js
pm2 start $DIR/queueToLevel.js
pm2 start $DIR/queueToElasticsearch.js
pm2 start $DIR/queueToPostgresql.js
pm2 start $DIR/startApi.js
pm2 flush
