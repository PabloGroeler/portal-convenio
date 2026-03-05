#!/bin/sh
set -e

# Create config.js from API_BASE env var so frontend can read window.__API_BASE__ at runtime
API_BASE=${API_BASE:-/api}
cat > /usr/share/nginx/html/config.js <<EOF
window.__API_BASE__ = '${API_BASE}';
EOF

# Start nginx
nginx -g 'daemon off;'

