#!/bin/sh

pm2 start $PROJECTOR_PATH/bin/projector.js
pm2 start $PROJECTOR_PATH/bin/store.js -f -- --store elasticsearch
pm2 start $PROJECTOR_PATH/bin/store.js -f -- --store level
pm2 start $PROJECTOR_PATH/bin/store.js -f -- --store postgresql
