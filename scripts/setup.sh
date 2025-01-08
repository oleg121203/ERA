Ваш скрипт в целом хорошо структурирован, но есть несколько моментов, которые можно улучшить для повышения читаемости и поддержки. Вот отформатированный и улучшенный вариант скрипта:

```bash
#!/bin/bash

# Зміна вигляду виводу терміналу
echo "export PS1='\[\e[31m\][\h]\[\e[0m\] Devcontainer \[\e[34mERA\[\e[0m\] \[\e[32m\]\$(__git_ps1 '(%s)')\[\e[0m\] $ '" >> ~/.bashrc

# Перевірка наявності Docker Compose
if ! command -v docker-compose &> /dev/null; then
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
cat << 'EOF' > .git/hooks/pre-commit
#!/bin/sh
npm run lint-staged
EOF
chmod +x .git/hooks/pre-commit

# Перевірка наявності структури проекту
if [ ! -f src/index.js ]; then
  echo 'Структура проекту не знайдена. Створення структури...'

  # Створення структури каталогів, якщо вони не існують
  mkdir -p src/{controllers,models,routes,services,utils,config,tests}
  mkdir -p client/src/{components,pages,assets,styles,utils,tests}
  mkdir -p docs scripts docker .requirements

  # Створення необхідних файлів
  touch src/index.js src/config/database.js src/config/app.js client/src/index.js .env.example .gitignore README.md docker-compose.yml .requirements/requirements.in

  # Додавання вмісту до файлів, якщо вони порожні
  [ ! -s src/config/app.js ] && echo "module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    jwtSecret: process.env.JWT_SECRET
  };" > src/config/app.js

  [ ! -s src/index.js ] && echo "const express = require('express');
  const config = require('./config/app');
  const app = express();
  app.use(express.json());
  app.listen(config.port, () => {
    console.log(\`Server running on port \${config.port}\`);
  });" > src/index.js

  [ ! -s .gitignore ] && echo "node_modules/
  .env
  dist/
  coverage/
  .DS_Store
  *.log" > .gitignore

  [ ! -s docker-compose.yml ] && echo "version: '3.8'
  services:
    app:
      build: .
      ports:
        - '3000:3000'
      environment:
        - NODE_ENV=development
      volumes:
        - .:/usr/src/app" > docker-compose.yml

  [ ! -s README.md ] && echo "# ERA Project

  ## Description
  A basic structure of a modern web application with a separation into frontend and backend parts, ready for scaling.

  ## Project Structure

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

  ### Common files:
  - docs/
  - scripts/
  - docker/" > README.md
fi

# Перевірка наявності prettier глобально
if ! command -v prettier &> /dev/null; then
  npm list -g prettier
fi
```

### Основные улучшения:
1. **Использование `command -v` для проверки наличия команд**: Это более надежный способ проверки наличия команд в системе.
2. **Использование `cat << 'EOF'` для создания файлов**: Это делает код более читаемым и позволяет избежать множественных `echo`.
3. **Форматирование многострочных строк**: Многострочные строки были отформатированы для улучшения читаемости.
4. **Удаление лишних пробелов и отступов**: Это делает код более чистым и легким для восприятия.

Эти изменения помогут сделать ваш скрипт более читаемым и поддерживаемым.