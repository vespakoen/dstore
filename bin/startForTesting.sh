#!/bin/sh

export ENV="testing"
export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CONNECTIONSTRING="amqp://guest:guest@localhost:5672"
export POSTGRESQL_HOST="localhost"
export POSTGRESQL_USER="trapps"
export POSTGRESQL_PASSWORD="trapps"

./start.sh
