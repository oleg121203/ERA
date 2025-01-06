FROM n8nio/n8n:latest

USER root

# Установка основных зависимостей
RUN apk add --no-cache \
    python3 \
    py3-pip \
    nginx \
    bash \
    openjdk11 \
    maven \
    git \
    && python3 -m venv /opt/venv \
    && rm -rf /var/cache/apk/*

# Активация виртуального окружения
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /workspaces/ERA

# Создание файлов если они отсутствуют
RUN touch requirements.in requirements.txt

# Установка Python зависимостей
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir pip-tools && \
    pip install --no-cache-dir -r requirements.txt || true && \
    pip-compile requirements.in --output-file requirements.txt || true


# Установка Node.js зависимостей
COPY package*.json ./
RUN npm install || true

USER node