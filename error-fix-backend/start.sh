#!/bin/bash

# Остановка существующего процесса
sudo kill $(sudo lsof -t -i:4001) 2>/dev/null || true

# Запуск сервера
sudo node server.js
