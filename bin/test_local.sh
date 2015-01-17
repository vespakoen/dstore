#!/bin/bash

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CONNECTIONSTRING="amqp://guest:guest@localhost:5672"
export POSTGRESQL_HOST="localhost"
export POSTGRESQL_PORT="5432"
export POSTGRESQL_USER="trapps"
export POSTGRESQL_PASSWORD="trapps"
export LEVEL_PATH="$DIR/../tests/out/level"
export SCHEMA_PATH="$DIR/../tests/out/schema"

bash $DIR/start.sh
bash $DIR/test.sh
