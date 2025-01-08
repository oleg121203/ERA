#!/bin/bash

# Install dependencies
npm init -y
npm install --save-dev prettier eslint eslint-config-prettier eslint-plugin-prettier

# Check if structure exists and overwrite flag is true
if [ ! -f src/index.js ] || [ "$1" = "true" ]; then
    echo 'Creating or updating project structure...'
    
    # Create directories
    mkdir -p src
    mkdir -p dist
    
    # Create initial files if they don't exist
    touch src/index.js
    
    # Format code with Prettier
    echo "Formatting code with Prettier..."
    npx prettier --write .
    
    # Lint code with ESLint
    echo "Linting code with ESLint..."
    npx eslint . --fix
    
    echo "Setup completed successfully!"
else
    echo "Project structure already exists. Use 'true' parameter to overwrite."
fi
