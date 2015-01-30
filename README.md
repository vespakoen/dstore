[![build status](https://travis-ci.org/trappsnl/node-projector.svg)](https://travis-ci.org/trappsnl/node-projector)
[![Code Climate](https://codeclimate.com/github/trappsnl/node-projector/badges/gpa.svg)](https://codeclimate.com/github/trappsnl/node-projector)

[![NPM](https://nodei.co/npm/node-projector.png?downloads=true)](https://nodei.co/npm/node-projector/)

#Introduction

node-projector can be seen as a interface to all your storage engines.

Via a simple REST API, you can manage the schema of your data, and store data with a single request and in a simple format.

Currently, node-projector supports **PostgreSQL**, **Elasticsearch** and **LevelDB**, the perfect stack for a modern web application.  


#Overview

![overview](http://trappsnl.github.io/node-projector/overview.png)


#Topics

- [Schemas](#schemas)  
- [Snapshots](#snapshots)
- [Storing & removing data](#storing--removing-data)
- [Commands](#commands)
    - Schema management
        - [Get all schemas](#get-all-schemas)
        - [Get schema](#get-schema)
        - [Put all schemas](#put-all-schemas)
        - [Put schema](#put-schema)
    - Snapshot management
        - [Create snapshot](#create-snapshot)
    - Item storage
        - [Put item](#put-item)
        - [Del item](#del-item)
- [Requirements](#requirements)
- [Installation](#installation)
- [Dive deeper](#dive-deeper)


#Schemas

The schema describes your data format, so the projectors know what data they can expect and know how to serialize it.  
A schema contains information like the table name, elasticsearch type, the columns and the validation options that should be used when data is stored.  
Let's look at an example how to create a schema for storing posts on my blog.
For this, we use the [put schema](#put-schema) command, and use "myblog" as the namespace, and "article" as the schemakey.

```shell
curl -X PUT http://localhost:2000/api/projects/myblog/schemas/article -d '
{
  "table": "articles",
  "elasticsearch_type": "article",
  "columns": {
    "title_nl": {
      "type": "string"
    },
    "title_en": {
      "type": "string"
    },
    "intro_nl": {
      "type": "text"
    },
    "intro_en": {
      "type": "text"
    },
    "content_nl": {
      "type": "text"
    },
    "content_en": {
      "type": "text"
    },
    "date_created": {
      "type": "datetime"
      "validation": {
        "required": true
      }
    },
    "date_changed": {
      "type": "datetime"
      "validation": {
        "required": true
      }
    }
  }
}'
```

I hope the format explains itself.

Below is a map of the available **column types**, and the type that it translates to in the storage engine.

<table>
  <tr>
    <th>column type</th>
    <th>postgresql type</th>
    <th>elasticsearch type</th>
    <th>leveldb type</th>
  </tr>
  <tr>
    <th>uuid</th>
    <td>UUID</td>
    <td>string</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>uuid[]</th>
    <td>UUID[]</td>
    <td>string</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>string</th>
    <td>STRING</td>
    <td>string</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>string[]</th>
    <td>STRING[]</td>
    <td>string</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>text</th>
    <td>TEXT</td>
    <td>text</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>text[]</th>
    <td>TEXT[]</td>
    <td>text</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>point</th>
    <td>GEOMETRY(Point, 4326)</td>
    <td>geo_point</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>point[]</th>
    <td>GEOMETRY(MultiPoint, 4326)</td>
    <td>geo_point</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>linestring</th>
    <td>GEOMETRY(LineString, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>linestring[]</th>
    <td>GEOMETRY(MultiLineString, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>polygon</th>
    <td>GEOMETRY(Polygon, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>polygon[]</th>
    <td>GEOMETRY(MultiPolygon, 4326)</td>
    <td>geo_shape</td>
    <td>Object (GeoJSON)</td>
  </tr>
  <tr>
    <th>date</th>
    <td>DATE</td>
    <td>date (format: yyyy-MM-dd)</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>date[]</th>
    <td>DATE[]</td>
    <td>date (format: yyyy-MM-dd)</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>datetime</th>
    <td>TIMESTAMP WITH TIMEZONE</td>
    <td>date (format: yyyy-MM-dd HH:mm:ss)</td>
    <td>String (JSON)</td>
  </tr>
  <tr>
    <th>datetime[]</th>
    <td>TIMESTAMP WITH TIMEZONE[]</td>
    <td>date (format: yyyy-MM-dd HH:mm:ss)</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>float</th>
    <td>REAL</td>
    <td>float</td>
    <td>Number (JSON)</td>
  </tr>
  <tr>
    <th>float[]</th>
    <td>REAL[]</td>
    <td>float</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>integer</th>
    <td>INTEGER</td>
    <td>integer</td>
    <td>Number (JSON)</td>
  </tr>
  <tr>
    <th>integer[]</th>
    <td>INTEGER[]</td>
    <td>integer</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>boolean</th>
    <td>BOOLEAN</td>
    <td>boolean</td>
    <td>Boolean (JSON)</td>
  </tr>
  <tr>
    <th>boolean[]</th>
    <td>BOOLEAN[]</td>
    <td>boolean</td>
    <td>Array (JSON)</td>
  </tr>
  <tr>
    <th>json</th>
    <td>JSON</td>
    <td>object</td>
    <td>Object (JSON)</td>
  </tr>
  <tr>
    <th>json[]</th>
    <td>JSON[]</td>
    <td>object</td>
    <td>Array (JSON)</td>
  </tr>
</table>

As you can see, we follow PostgreSQL's [] notation for defining *an array* of something.

#Snapshots

When you are done adding schemas, it's time to create a snapshot.
By creating a snapshot we are saving the current state of all schemas, and assign a snapshot version number to it.
After the snapshot is stored, the migrators for every projector will kick into action to create new databases / elasticsearch indexes, tables and type mappings.
For LevelDB, it's quite easy. Since it's schemaless we don't have to migrate anything.

You can create a snapshot with the [create snapshot](#create-snapshot) command:

```shell
curl -X POST http://localhost:2000/api/projects/myblog/snapshots
```

When the request completes, the storage engines are ready to handle data with the new schema.


#Storing & removing data

Storing data is done via a simple PUT command.
The request body is JSON and should, at the very least contain the following keys:

- **snapshot_version** An existing snapshot version
- **id** A UUID that does or does not yet exist in the database

You can also include a **links** key that is an array of UUID's, pointing to other items  
*Internally (and above), we refer to data as an "item", this is the same concept as a elasticsearch document or a table row.*

Below is an example:
```shell
curl -X PUT http://localhost:2000/api/projects/myblog/items/article/66276124-ebcd-45e1-8013-825346daa283 -d '
{
  "id": "66276124-ebcd-45e1-8013-825346daa283",
  "snapshot_version": 1,
  "title_nl": "De titel",
  "title_en": "Some title",
  "intro_nl": "De intro",
  "intro_en": "The intro",
  "content_nl": "De inhoud",
  "content_en": "The content",
  "date_created": "2014-01-17 03:50:12",
  "date_updated": "2014-01-17 03:50:12"
}'
```

Deleting an item is not so difficult either:
```shell
curl -X DELETE http://localhost:2000/api/projects/myblog/items/article/66276124-ebcd-45e1-8013-825346daa283
```

#Commands

At this moment, the only way to communicate with node-projector is via a JSON API.  
**In the future we might add support for communication with node-projector via RabbitMQ**

The following commands are available

## get schema

**Retrieves a single schema for a given namespace and schema key.**

*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  
*Coninuing from the previous blog example, the schemaKey could be a "post", "author" or a "comment"*

```shell
curl -X GET http://localhost:2000/api/projects/:namespace/schemas/:schema_key/:snapshot_version
```

## put schema

**Stores a single schema for a given namespace and schema key.**

*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  

```shell
curl -X PUT http://localhost:2000/api/projects/:namespace/schemas/:schema_key -d '
{
  "table": "articles",
  "elasticsearch_type": "article",
  "columns": {
    "title": {
      "type": "string"
    }
  }
}'
```

## create snapshot

**Stores the current schemas as a snapshot.**

*The "put schema" and "put all schemas" commands modify the "current" schema*  
*If you are happy with the schema, you create a snapshot.*
*This will trigger the migrations that will:*  

- create a postgresql database (named: namespace + 'v' + snapshotVersion)
- create database tables
- create an elasticsearch index (named: namespace + 'v' + snapshotVersion)
- put the elasticsearch mappings
- create or replace an alias from "namespace" to "namespace + 'v' + snapshotVersion"

```shell
curl -X POST http://localhost:2000/api/projects/:namespace/snapshots
```

## put item

**Projects an item to all storage backends.**

*The namespace is an identifier for a project.*  
*The schema key is a string that uniquely identifies your schema*  

```shell
curl -X PUT /api/projects/:namespace/items/:schema_key/:id -d '
{
  "id": "66276124-ebcd-45e1-8013-825346daa283",
  "snapshot_version": 1,
  "title": "Some title"
}'
```

## del item

**Deletes an item in all storage backends.**

```shell
curl -X DELETE /api/projects/:namespace/items/:schema_key/:id
```

#Requirements

- [Node.js](http://nodejs.org/)
- [RabbitMQ](https://www.rabbitmq.com)
- [PostgreSQL](http://www.postgresql.org)
- [PostgreSQL contrib modules](http://www.postgresql.org/docs/9.3/static/uuid-ossp.html) (for UUID support)
- [Postgis](http://www.postgis.net) (for spatial support)
- A "template_postgis" [template](http://www.postgresql.org/docs/9.3/static/sql-createdatabase.html) with uuid and/or postgis support
- A PostgreSQL user with premissions for creating databases
- [Elasticsearch](http://www.elasticsearch.org/)

To run the script, you must make the following environment variables available.

```shell
export POSTGRESQL_HOST="localhost"
export POSTGRESQL_PORT="5432"
export POSTGRESQL_USER="..."
export POSTGRESQL_PASSWORD="..."
export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CONNECTIONSTRING="amqp://guest:guest@localhost:5672"
export LEVEL_PATH="storage/level"
export SCHEMA_PATH="storage/schema"
export API_PORT="2000"
```

#Installation

It's quite a lot to install and configure, so we are planning to include a docker container in the future.

For now, these instructions should get you going on Ubuntu 14.04.

```shell
# install node-projector
npm install --save node-projector

# install PM2 (node.js process manager)
sudo npm install -g pm2

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
export POSTGRESQL_HOST="localhost"
export POSTGRESQL_PORT="5432"
export POSTGRESQL_USER="..."
export POSTGRESQL_PASSWORD="..."
export ELASTICSEARCH_HOST="http://localhost:9200"
export QUEUE_CONNECTIONSTRING="amqp://guest:guest@localhost:5672"
export LEVEL_PATH="storage/level"
export SCHEMA_PATH="storage/schema"
export API_PORT="2000"

# start node-projector
cd path/to/node-projector/bin && ./start.sh
```

#Dive deeper
Head over to the [Api docs](http://trappsnl.github.io/node-projector) to learn more about the internals.
