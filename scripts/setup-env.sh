#!/bin/bash

# Переходим на npm вместо yarn
npm install -g prettier typescript eslint

# Добавляем путь к глобальным npm пакетам
export PATH="/usr/local/share/npm-global/bin:$PATH"

# Проверяем наличие форматтеров
command -v prettier >/dev/null 2>&1 || { echo "Installing prettier..."; npm install -g prettier; }
command -v eslint >/dev/null 2>&1 || { echo "Installing eslint..."; npm install -g eslint; }
command -v tsc >/dev/null 2>&1 || { echo "Installing typescript..."; npm install -g typescript; }

# Пример использования путей конфигурации
ESLINT_CONFIG_PATH="../config/.eslintrc.js"
PRETTIER_CONFIG_PATH="../config/.prettierrc.js"

# Проверяем системную переменную
if [ -n "$GEMINI_API_KEY" ]; then
    echo "Используется GEMINI_API_KEY из системных переменных"
    # Обновляем .env файл с существующим ключом
    cat > "$(dirname "$0")/../.env" << EOL
GEMINI_API_KEY=${GEMINI_API_KEY}
DEBUG=${DEBUG:-true}
NODE_ENV=development
PATH=${PATH}
EOL
    echo "Конфигурация обновлена"
    exit 0
fi

# Запрашиваем API ключ у пользователя если он не передан
if [ -z "$1" ]; then
  read -p "Введите ваш Gemini API ключ: " GEMINI_API_KEY
else
  GEMINI_API_KEY=$1
fi

# Проверяем что ключ не пустой
if [ -з "$GEMINI_API_KEY" ]; then
  echo "Error: API ключ не может быть пустым"
  exit 1
fi

# Экспортируем переменные
export GEMINI_API_KEY="${GEMINI_API_KEY}"
export DEBUG=true

# Сохраняем в .env
cat > "$(dirname "$0")/../.env" << EOL
GEMINI_API_KEY=${GEMINI_API_KEY}
DEBUG=${DEBUG}
NODE_ENV=development
PATH=${PATH}
EOL

# Добавляем переменные в текущую сессию
if [ -f ~/.bashrc ]; then
    grep -v "GEMINI_API_KEY\|DEBUG" ~/.bashrc > ~/.bashrc.tmp
    echo "export GEMINI_API_KEY=\"${GEMINI_API_KEY}\"" >> ~/.bashrc.tmp
    echo "export DEBUG=${DEBUG}" >> ~/.bashrc.tmp
    mv ~/.bashrc.tmp ~/.bashrc
fi

# Выводим текущие значения:
echo "Текущие значения:"
echo "GEMINI_API_KEY=${GEMINI_API_KEY}"
echo "DEBUG=${DEBUG}"

# Проверяем установку переменных
if [ -з "$GEMINI_API_KEY" ]; then
    echo "Ошибка: GEMINI_API_KEY не установлен"
    exit 1
fi

# Выводим сообщение об успехе
echo "API ключ успешно установлен в .env файл"
