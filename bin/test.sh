#!/bin/bash

# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
TAPE="$DIR/../node_modules/tape/bin/tape"
TAPSPEC="$DIR/../node_modules/tap-spec/bin/cmd.js"

node $TAPE tests/testSchemaClient.js tests/testSchemaService.js | node $TAPSPEC
