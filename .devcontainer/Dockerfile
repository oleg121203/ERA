# Базовий образ node:20-bookworm, сумісний з mcr.microsoft.com/devcontainers/javascript-node:20-bookworm
FROM mcr.microsoft.com/devcontainers/typescript-node:latest

# Оновлюємо пакети та інсталюємо code-server
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://code-server.dev/install.sh | sh

# Ensure /workspaces exists and has correct permissions
RUN mkdir -p /workspaces && chown node:node /workspaces

# (Опційно) можете встановлювати інші пакети:
# RUN apt-get install -y git vim ...

# Робоча тека відповідає "workspaceFolder"
WORKDIR /workspaces/ERA

# Switch to non-root user
USER node