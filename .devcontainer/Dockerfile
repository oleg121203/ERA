FROM n8nio/n8n:latest

# Set the user to root
USER root

# Install Python, pip, Nginx и Bash с проверкой ошибок
RUN apt-get update && \
    apt-get install -y python3 python3-pip nginx bash && \
    python3 -m venv /opt/venv && \
    rm -rf /var/lib/apt/lists/*

# Activate virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Create directory for requirements
WORKDIR /workspaces/ERA

# Copy requirements from workspace
COPY ../requirements.txt .

# Install dependencies once
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip-compile requirements.txt

# Set back to node user
USER node