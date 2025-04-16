#!/bin/sh
yarn global add pm2
pm2 start ecosystem.config.js
pm2 logs --no-daemon