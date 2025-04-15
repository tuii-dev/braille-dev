#!/bin/sh
LANGCHAIN_CALLBACKS_BACKGROUND=true yarn start:prod &
sleep 2  # Give PM2 time to start
pm2 logs --raw
