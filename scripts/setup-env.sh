#!/bin/bash

# Экспортируем переменные окружения
export GEMINI_API_KEY="AIzaSyCKdHXI2CND5TlsGscB2vlIUluet5MQrDo"
export DEBUG=true

# Сохраняем переменные в файл .env
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
