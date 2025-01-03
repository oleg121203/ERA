#!/bin/bash

# Встановлюємо глобальні пакети
npm install -g prettier typescript eslint

# Додаємо шлях до глобальних пакетів
export PATH="$(yarn global bin):$PATH"

# Проверяем наличие форматтеров
command -v prettier >/dev/null 2>&1 || { echo "Устанавливаем prettier..."; yarn global add prettier; }
command -v eslint >/dev/null 2>&1 || { echo "Устанавливаем eslint..."; yarn global add eslint; }
command -v tsc >/dev/null 2>&1 || { echo "Устанавливаем typescript..."; yarn global add typescript; }

# Проверяем системную переменную
if [ -n "$GEMINI_API_KEY" ]; then
    echo "Используется GEMINI_API_KEY из системных переменных"
    # Обновляем .env файл с существующим ключом
    cat > "$(dirname "$0")/../.env" << EOL
GEMINI_API_KEY=${GEMINI_API_KEY}
DEBUG=${DEBUG:-true}
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
if [ -z "$GEMINI_API_KEY" ]; then
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
EOL

# Добавляем переменные в текущую сессию
if [ -f ~/.bashrc ]; then
    grep -v "GEMINI_API_KEY\|DEBUG" ~/.bashrc > ~/.bashrc.tmp
    echo "export GEMINI_API_KEY=\"${GEMINI_API_KEY}\"" >> ~/.bashrc.tmp
    echo "export DEBUG=${DEBUG}" >> ~/.bashrc.tmp
    mv ~/.bashrc.tmp ~/.bashrc
fi

# Выводим текущие значения
echo "Текущие значения:"
echo "GEMINI_API_KEY=${GEMINI_API_KEY}"
echo "DEBUG=${DEBUG}"

# Проверяем установку переменных
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Ошибка: GEMINI_API_KEY не установлен"
    exit 1
fi

# Выводим сообщение об успехе
echo "API ключ успешно установлен в .env файл"
