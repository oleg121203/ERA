node src/main.js analyze scripts/project-structure.ts \
  --types=security:confidence=90:impact=80:priority=85,performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --format

npm notice
npm notice New major version of npm available! 10.8.2 -> 11.0.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.0.0
npm notice To update run: npm install -g npm@11.0.0

План анализа:
Анализ процесса автоматического исправления
Проверка логики применения исправлений
Поиск точек отказа

node src/main.js analyze scripts/project-structure.ts \
  --  types=performance:confidence=90:impact=80:priority=85,performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --format


  node src/main.js analyze scripts/project-structure.ts --types=basic --fix=80

  # Базовый анализ файла
node src/main.js analyze ./src/main.js --basic

# Анализ с проверкой безопасности и производительности
node src/main.js analyze ./src/main.js \
  --types=security,performance \
  --fix=80 \
  --auto-apply

# Полный анализ с метриками
node src/main.js analyze ./src/main.js \
  --types=basic,security,performance \
  --metrics \
  --fix=80 \
  --format

# Интерактивный режим
node src/main.js analyze ./src \
  --interactive \
  --metrics \
  --depth=2