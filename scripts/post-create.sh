#!/bin/bash

# Ensure proper permissions for workspaces
sudo chown -R node:node /workspaces
sudo chmod -R 755 /workspaces

# Setup environment
if [ -f .env ]; then
    source .env
fi

# Install dependencies
npm install

# Fix potential npm audit issues
npm audit fix || true

echo "Container setup completed successfully"
