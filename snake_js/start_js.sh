
#!/bin/bash

# ...existing code...

# Запуск сервера на порту 4000, привязка к 0.0.0.0 для доступа извне
python -m http.server 4000 --bind 0.0.0.0

# ...existing code...