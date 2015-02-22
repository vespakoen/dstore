sudo su postgres -c "psql -t -A <<EOF
SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres';
EOF" | while read db
do
echo "Dropping database $db"
sudo su postgres -c "psql <<FOF
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$db';
DROP DATABASE $db;
FOF" > /dev/null
done

echo "Dropping all indexes"
curl -XDELETE http://localhost:9200/_all > /dev/null

echo "Dropping all queues"
sudo rabbitmqctl stop_app && sudo rabbitmqctl reset && sudo rabbitmqctl start_app
