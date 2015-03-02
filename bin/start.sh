#!/bin/bash

pm2 start $PROJECTOR_PATH/bin/dstore.js

stores=`echo $STORES | sed -e 's/,/\n/g'`
while read -r store
do
  pm2 start $PROJECTOR_PATH/bin/dstore.js -f -- --store $store
done <<< "$stores"
