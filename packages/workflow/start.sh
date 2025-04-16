#!/bin/sh

# Add node_modules/.bin to PATH
export PATH="/app/node_modules/.bin:$PATH"

# Start PM2 services
LANGCHAIN_CALLBACKS_BACKGROUND=true yarn start:prod

# Give services a moment to initialize
sleep 2

# Show PM2 status
echo "PM2 Status:"
/app/node_modules/.bin/pm2 list

# Keep the container running with the PM2 process
exec /app/node_modules/.bin/pm2 logs
