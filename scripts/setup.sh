#!/bin/bash

# Создание структуры каталогов, если они не существуют
mkdir -p src/{controllers,models,routes,services,utils,config,tests}
mkdir -p client/src/{components,pages,assets,styles,utils,tests}
mkdir -p docs scripts docker

# Создание основных файлов, если они не существуют
[ ! -f src/index.js ] && touch src/index.js
[ ! -f src/config/database.js ] && touch src/config/database.js
[ ! -f src/config/app.js ] && touch src/config/app.js
[ ! -f client/src/index.js ] && touch client/src/index.js
[ ! -f .env.example ] && touch .env.example
[ ! -f .gitignore ] && touch .gitignore
[ ! -f README.md ] && touch README.md
[ ! -f docker-compose.yml ] && touch docker-compose.yml

# Добавление содержимого в файлы, только если они пусты
if [ ! -s src/config/app.js ]; then
    cat <<EOL > src/config/app.js
module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  jwtSecret: process.env.JWT_SECRET
};
EOL
fi

if [ ! -s src/index.js ]; then
    cat <<EOL > src/index.js
const express = require('express');
const config = require('./config/app');

const app = express();

app.use(express.json());

app.listen(config.port, () => {
  console.log(\`Server running on port \${config.port}\`);
});
EOL
fi

# client/src/index.js - добавьте необходимое содержимое для frontend

if [ ! -s .gitignore ]; then
    cat <<EOL > .gitignore
node_modules/
.env
dist/
coverage/
.DS_Store
*.log
EOL
fi

if [ ! -s docker-compose.yml ]; then
    cat <<EOL > docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/usr/src/app
EOL
fi

if [ ! -s README.md ]; then
    cat <<EOL > README.md
# ERA Project

## Описание
Базовая структура современного веб-приложения с разделением на frontend и backend части, готовая к масштабированию.

## Структура проекта

### Backend:
- src/
  - controllers/
  - models/
  - routes/
  - services/
  - utils/
  - config/
  - tests/

### Frontend:
- client/
  - src/
    - components/
    - pages/
    - assets/
    - styles/
    - utils/
    - tests/

### Общие файлы:
- docs/
- scripts/
- docker/
EOL
fi