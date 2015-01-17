#!/bin/sh

export ENV="testing"
export POSTGRESQL_HOST="localhost:5432"
export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CONNECTIONSTRING="amqp://guest:guest@localhost:5672"
export POSTGRESQL_USER="postgres"
export POSTGRESQL_PASSWORD=""

./start.sh
