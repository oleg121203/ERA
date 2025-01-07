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
    curl \
    && python3 -m venv /opt/venv \
    && rm -rf /var/cache/apk/*

# Установка kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    rm kubectl

# Активация виртуального окружения
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /workspaces/ERA

# Создание файлов если они отсутствуют
RUN mkdir -p .requirements && touch .requirements/requirements.in requirements.txt

# Установка Python зависимостей
COPY .requirements/requirements.in .requirements/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir pip-tools && \
    pip-compile .requirements/requirements.in --output-file requirements.txt || true && \
    pip install --no-cache-dir -r requirements.txt || true

# Установка Node.js зависимостей
COPY package*.json ./
RUN npm install || true

USER node