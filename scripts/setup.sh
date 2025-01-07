#!/bin/bash

# Перевірка наявності Docker Compose
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Docker Compose не встановлений. Встановлення...' >&2
  sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo 'Docker Compose встановлено.'
else
  echo 'Docker Compose вже встановлений.'
fi

# Установка npm зависимостей
npm install

# Установка Git hooks
mkdir -p .git/hooks
echo '#!/bin/sh' > .git/hooks/pre-commit
echo 'npm run lint-staged' >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Перевірка наявності структури проекту
if [ ! -f src/index.js ]; then
  echo 'Структура проекту не знайдена. Створення структури...'

  # Створення структури каталогів, якщо вони не існують
  mkdir -p src/{controllers,models,routes,services,utils,config,tests}
  mkdir -p client/src/{components,pages,assets,styles,utils,tests}
  mkdir -p docs scripts docker .requirements

  # Створення основних файлів, якщо вони не існують
  [ ! -f src/index.js ] && touch src/index.js
  [ ! -f src/config/database.js ] && touch src/config/database.js
  [ ! -f src/config/app.js ] && touch src/config/app.js
  [ ! -f client/src/index.js ] && touch client/src/index.js
  [ ! -f .env.example ] && touch .env.example
  [ ! -f .gitignore ] && touch .gitignore
  [ ! -f README.md ] && touch README.md
  [ ! -f docker-compose.yml ] && touch docker-compose.yml
  [ ! -f .requirements/requirements.in ] && touch .requirements/requirements.in

  # Додавання вмісту до файлів, тільки якщо вони порожні
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

  # client/src/index.js - додайте необхідний вміст для frontend

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

  echo 'Структура проекту створена.'
else
  echo 'Структура проекту вже існує.'
fi