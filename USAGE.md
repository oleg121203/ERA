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
1. Анализ процесса автоматического исправления
2. Проверка логики применения исправлений
3. Поиск точек отказа

node src/main.js analyze scripts/project-structure.ts \
  --types=performance:confidence=90:impact=80:priority=85,performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --format

node src/main.js analyze scripts/project-structure.ts --types=basic --fix=80

# Базовый анализ TypeScript файла
node src/main.js analyze /workspaces/ERA/.devcontainer/extension.ts \
  --basic \
  --lang=typescript

# Анализ безопасности и производительности
node src/main.js analyze /workspaces/ERA/.devcontainer/extension.ts \
  --types=security,performance \
  --fix=80 \
  --auto-apply \
  --ts-config=/workspaces/ERA/tsconfig.json

# Полный анализ с метриками
node src/main.js analyze /workspaces/ERA/.devcontainer/extension.ts \
  --types=basic,security,performance \
  --metrics \
  --fix=80 \
  --format \
  --strict

# Интерактивный анализ расширения
node src/main.js analyze /workspaces/ERA/.devcontainer \
  --interactive \
  --metrics \
  --depth=2 \
  --include="**/*.ts" \
  --exclude="node_modules"

Проведу анализ та надам команди для тестування.

Аналіз взаємодії компонентів:
1. Структура проекту логічна і всі компоненти правильно пов’язані
2. Система типів TypeScript коректна
3. Конфігурація і константи відокремлені
4. Обробка помилок реалізована належним чином
5. Форматтери та аналізатори інтегровані коректно

Ось декілька команд для тестування над папкою test:

1. Базовий аналіз з автоматичним форматуванням:
```bash
node src/main.js analyze --file=./test --types=--basic --format --auto-apply
```

2. Глибокий аналіз безпеки та продуктивності:
```bash
node src/main.js analyze --file=./test --types=--deep,--security,--performance --recursive --fix=80
```

3. Аналіз структури коду з форматуванням:
```bash
node src/main.js analyze --file=./test --types=--structure --format --auto-apply --fix=70
```

4. Комплексний аналіз з усіма перевірками:
```bash
node src/main.js analyze --file=./test --types=--basic,--security,--performance,--complexity --recursive --format --auto-apply --fix=75
```

Додаткові параметри, які можна комбінувати:
- `--recursive`: рекурсивний аналіз всіх файлів у папці
- `--format`: автоматичне форматування коду
- `--auto-apply`: автоматичне застосування виправлень
- `--fix=N`: поріг впевненості для автоматичних виправлень (0-100)

Перед запуском переконайтесь що:
1. Встановлені всі залежності (`npm install`)
2. Налаштований файл `.env` з API ключем
3. Запущений скрипт `scripts/setup-env.sh`
4. Встановлені глобально prettier, eslint і typescript

Давайте розберемо ці моменти:

1. Щодо рекурсивного сканування:
- Якщо ви хочете просканувати папку з усіма вкладеними директоріями, потрібно додати флаг `--recursive`
- Без цього флагу буде проаналізовано тільки файли в зазначеній директорії, без вкладених папок

Правильний формат команди з рекурсивним скануванням:
```bash
node src/main.js analyze ./test --recursive --types=basic,security --fix=80
```

2. Щодо метрик:
- Формат `confidence=90:impact=80:priority=85` правильний, але його краще використовувати для кожного типу аналізу окремо
- Значення метрик:
  - `confidence`: впевненість аналізу (0-100%)
  - `impact`: вплив проблеми (0-100%)
  - `priority`: пріоритет виправлення (0-100%)

Приклад правильного використання метрик:
```bash
node src/main.js analyze ./tests --recursive \
  --types=security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --format
```

Рекомендовані значення метрик:
- Для критичних перевірок безпеки:
  - confidence: 90-95%
  - impact: 80-90%
  - priority: 85-95%

- Для перевірок продуктивності:
  - confidence: 80-85%
  - impact: 70-80%
  - priority: 75-85%

- Для базового аналізу:
  - confidence: 75-80%
  - impact: 65-75%
  - priority: 70-80%

  node src/main.js analyze scripts/project-structure.ts \
      --types=security:confidence=90:impact=80:priority=85,performance:confidence=85:impact=75:priority=80 \
      --fix=80 \
      --auto-apply \
      --format


node src/main.js analyze ./test --recursive \
  --types=security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --format