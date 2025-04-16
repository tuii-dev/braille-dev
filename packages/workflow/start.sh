#!/bin/sh

# Start PM2 services
LANGCHAIN_CALLBACKS_BACKGROUND=true yarn start:prod

# Give services a moment to initialize
sleep 2

# Show PM2 status
echo "PM2 Status:"
pm2 list

# Keep the container running with the PM2 process
exec pm2 logs
