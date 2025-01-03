FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm

# Update and install code-server
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://code-server.dev/install.sh | sh

WORKDIR /workspaces/ERA
