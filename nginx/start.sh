#!/bin/sh
echo "Access system at:  http://localhost:8198)"
# Ensure the log directory exists
mkdir -p /var/log/nginx

# Create empty log files
: > /var/log/nginx/access.log
nginx -g "daemon off;"
