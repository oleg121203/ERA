#!/bin/bash
# Зміна вигляду виводу терміналу
echo "export PS1='\[\e[31m\][\h]\[\e[0m\] Devcontainer \[\e[34mERA\[\e[0m\] \[\e[32m\]\$(__git_ps1 '(%s)')\[\e[0m\] $ '" >> ~/.bashrc
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
  # Create necessary files
  touch src/index.js src/config/database.js src/config/app.js client/src/index.js .env.example .gitignore README.md docker-compose.yml .requirements/requirements.in
  # Add content to files if empty
  [ ! -s src/config/app.js ] && echo "module.exports = { port: process.env.PORT || 3000, env: process.env.NODE_ENV || 'development', apiVersion: process.env.API_VERSION || 'v1', jwtSecret: process.env.JWT_SECRET };" > src/config/app.js
  [ ! -s src/index.js ] && echo "const express = require('express'); const config = require('./config/app'); const app = express(); app.use(express.json()); app.listen(config.port, () => { console.log(\`Server running on port \${config.port}\`); });" > src/index.js
  [ ! -s .gitignore ] && echo "node_modules/\n.env\ndist/\ncoverage/\n.DS_Store\n*.log" > .gitignore
  [ ! -s docker-compose.yml ] && echo "version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    environment:\n      - NODE_ENV=development\n    volumes:\n      - .:/usr/src/app" > docker-compose.yml
  [ ! -s README.md ] && echo "# ERA Project\n\n## Description\nA basic structure of a modern web application with a separation into frontend and backend parts, ready for scaling.\n\n## Project Structure\n\n### Backend:\n- src/\n  - controllers/\n  - models/\n  - routes/\n  - services/\n  - utils/\n  - config/\n  - tests/\n\n### Frontend:\n- client/\n  - src/\n    - components/\n    - pages/\n    - assets/\n    - styles/\n    - utils/\n    - tests/\n\n### Common files:\n- docs/\n- scripts/\n- docker/" > README.md
fi
# Check if prettier is installed globally
if ! [ -x "$(command -v prettier)" ]; then
  npm list -g prettier
fi
