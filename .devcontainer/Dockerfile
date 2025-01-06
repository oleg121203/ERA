# Используем Alpine Linux образ как базовый
FROM n8nio/n8n:latest

# Переключаемся на root для установки пакетов
USER root

# Устанавливаем Python и pip используя apk (пакетный менеджер Alpine)
RUN apk update && \
    apk add --no-cache python3 py3-pip nginx && \
    python3 -m venv /opt/venv && \
    rm -rf /var/cache/apk/*

# Активируем виртуальное окружение
ENV PATH="/opt/venv/bin:$PATH"

# Создаем директорию для requirements
WORKDIR /workspaces/ERA

# Копируем requirements из workspace
COPY ../requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir pip-tools && \
    pip install --no-cache-dir -r requirements.txt && \
    pip-compile --output-file requirements.lock requirements.txt

# Возвращаемся к пользователю node
USER node