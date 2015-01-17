#Introduction

node-projector can be viewed as a interface to all your storage engines.  
Via a simple REST API, you can manage the schema of your data, and store data with a single request and in a simple format.  
Currently, node-projector supports **PostgreSQL**, **Elasticsearch** and **LevelDB**, the perfect stack for a modern web application.  

#Overview

![overview](http://trappsnl.github.io/node-projector/overview.svg)

#Topics
- [Schemas](#schemas)  
- [Snapshots](#snapshots)
- [Storing & removing data](#storing-and-retrieving)


#Schemas

The schema describes your data format, so the projectors know what data they can expect and know how to serialize it.  
A schema contains information like the table name, elasticsearch type, the columns and the validation rules that should be used when data is stored.  
Let's look at an example how to create a schema for storing posts on my blog.  
For this, we use the [put schema](#put-schema) command.  

```shell
curl -X PUT http://localhost:2000/api/schema/myblog/article -d '\
{\
  "table": "articles",\
  "es_type": "article",\
  "columns": {\
    "title_nl": {\
      "type": "string"\
    },\
    "title_en": {\
      "type": "string"\
    },\
    "intro_nl": {\
      "type": "text"\
    },\
    "intro_en": {\
      "type": "text"\
    },\
    "content_nl": {\
      "type": "text"\
    },\
    "content_en": {\
      "type": "text"\
    },\
    "date_created": {\
      "type": "date"\
      "rules": [{"type": "isDate"}]\
    },\
    "date_changed": {\
      "type": "date"\
      "rules": [{"type": "isDate"}]\
    }\
  }\
}'
```

As you can see
*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  

#Snapshots

Migrators use the schema to create the database and elasticsearch index, and create the tables & mappings.
For LevelDB, it's quite easy, since it's schemaless we don't have to migrate anything.


#Storing & removing data

In the schema you define a table name, elasticsearch type and the columns with their types, validation rules and optional options for the projectors can also be given.
Migrators for every storage engine will use this information to create the database and elasticsearch index, and create the appropiate tables & mappings.
For LevelDB, it's quite easy, since it's schemaless we don't have to migrate anything.

By creating a snapshot, all the changes we made to the schema are stored, and assigned a schema version number.
This is an incrementing number and the first 

, in the background, node-projector will create databases, and their tables.


node-projector is a schema manager, and data projector.  
In practice, when we send a schema to it, and create a snapshot,  
It will create a postgresql database and elasticsearch index and create the necessary tables and mappings.  
Then, when we store an item, it will automatically serialize it appropiately and store it.  
In the future, we can use the schema information to transform items to newer / older versions of the schema.  

- elasticsearch
- postgresql
- leveldb

#Requirements

- [Node.js](http://nodejs.org/)
- [RabbitMQ](https://www.rabbitmq.com)
- [PostgreSQL](http://www.postgresql.org)
- [PostgreSQL contrib modules](http://www.postgresql.org/docs/9.3/static/uuid-ossp.html) (for UUID support)
- [Postgis](http://www.postgis.net) (for spatial support)
- A "template_postgis" [template](http://www.postgresql.org/docs/9.3/static/sql-createdatabase.html) with uuid and/or postgis support
- [Elasticsearch](http://www.elasticsearch.org/)

To run the script, you must make the following environment variables available.

```shell
export POSTGRESQL_HOST=localhost:5432
export POSTGRESQL_USER=...
export POSTGRESQL_PASSWORD=...
export ELASTICSEARCH_HOST=http://localhost:9200
export QUEUE_CONNECTIONSTRING=amqp://guest:guest@localhost:5672
```

##Installation

These instructions are for Ubuntu 14.04.

```
# install rabbitmq
sudo apt-get install rabbitmq-server

# install postgresql
sudo apt-get install postgresql-9.3 postgresql-contrib

# install postgis (only if you need spatial support)
sudo apt-get install postgresql-9.3-postgis-2.1

# change user to postgres
sudo su postgres

# create postgresql database
createdb -E UTF8 -T template0 template_postgis

# create postgis template for postgresql (only if you need spatial support)
psql template_postgis <<EOF
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION postgis;
UPDATE pg_database SET datistemplate = TRUE WHERE datname = 'template_postgis';
EOF

# install elasticsearch (follow instructions over there!)
firefox https://gist.github.com/gourneau/66e0bd90c92ad829590b

# export necessary config variables
export POSTGRESQL_HOST=localhost:5432
export POSTGRESQL_USER=...
export POSTGRESQL_PASSWORD=...
export ELASTICSEARCH_HOST=http://localhost:9200
export QUEUE_CONNECTIONSTRING=amqp://guest:guest@localhost:5672

# start node-projector
cd path/to/node-projector/bin && ./start.sh
```

#Commands

At this moment, the only way to communicate with node-projector is via a JSON API.  
The following commands are available

## get all schemas

**Retrieves all the schema definitions for a given namespace.**

*The namespace is an identifier for a project.*  
*Say you are making a blog and a homepage, you could use the namespaces: "blog" and "homepage"*

```shell
curl -X GET http://localhost:2000/api/schema/:namespace
```

## get schema

**Retrieves a single schema for a given namespace and schema key.**

*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  
*Coninuing from the previous blog example, the schemaKey could be a "post", "author" or a "comment"*

```shell
curl -X GET http://localhost:2000/api/schema/:namespace/:schemaKey
```

## put all schemas

**Stores all schemas for a given namespace.**

*The namespace is an identifier for a project.*  

```shell
curl -X PUT http://localhost:2000/api/schema/:namespace -d '\
{\
  "article": {\
    "table": "articles",\
    "es_type": "article",\
    "columns": {\
      "title": {\
        "type": "text"\
      }\
    }\
  }\
}'
```

## put schema

**Stores a single schema for a given namespace and schema key.**

*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  

```shell
curl -X PUT http://localhost:2000/api/schema/:namespace/:schemaKey -d '\
{\
  "table": "articles",\
  "es_type": "article",\
  "columns": {\
    "title": {\
      "type": "string"\
    }\
  }\
}'
```

## create snapshot

**Stores the current schemas as a snapshot.**

*The "put schema" and "put all schemas" commands modify the "current" schema*  
*If you are happy with the schema, you create a snapshot which will give the schema a version number*  
*This will also trigger the migrations that will:*  

- create a postgresql database (named: namespace + 'v' + snapshotVersion)
- create database tables
- create an elasticsearch index (named: namespace + 'v' + snapshotVersion)
- put the elasticsearch mappings
- create or replace an alias from "namespace" to "namespace + 'v' + snapshotVersion"

```shell
curl -X POST http://localhost:2000/api/snapshot/:namespace
```

## put item

**Projects an item to all storage backends.**

*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  

```shell
curl -X PUT http://localhost:2000/api/item/:namespace/:schemaKey -d '\
{\
  "id": "66276124-ebcd-45e1-8013-825346daa283",\
  "version": 1,\
  "title": "Some title"\
}'
```

## del item

**Deletes an item in all storage backends.**

```shell
curl -X DELETE http://localhost:2000/api/item/:namespace/:schemaKey
```

#API docs

Head over to the [Api docs](http://trappsnl.github.io/node-projector) to learn more about the internals.
