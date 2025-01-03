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

### Шаг 1: Установка модуля `axios`

Установите модуль `axios` с помощью npm:

```bash
npm install axios
```

```markdown
# Комплексна команда для аналізу всього функціоналу додатка

Використовуйте наступну команду для виконання повного аналізу вашого проекту з усіма доступними параметрами:

```bash
node src/main.js analyze ./ --recursive \
  --types=basic:confidence=80:impact=70:priority=75,\
security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80,\
breakpoint:confidence=80:impact=70:priority=75,\
imports:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --format \
  --metrics \
  --strict \
  --depth=2 \
  --include="**/*.ts" \
  --exclude="node_modules"
```

## Опис параметрів:

- 

ERA

: Кореневий каталог проекту для аналізу.
- `--recursive`: Рекурсивний аналіз всіх файлів у зазначеній директорії та піддиректоріях.
- `--types`: Типи аналізу з відповідними метриками для кожного типу:
  - `basic:confidence=80:impact=70:priority=75`
  - `security:confidence=90:impact=80:priority=85`
  - `performance:confidence=85:impact=75:priority=80`
  - `breakpoint:confidence=80:impact=70:priority=75`
  - `imports:confidence=85:impact=75:priority=80`
- `--fix=80`: Поріг впевненості для автоматичних виправлень (0-100).
- `--auto-apply`: Автоматичне застосування виправлень.
- `--format`: Автоматичне форматування коду.
- `--metrics`: Виведення метрик аналізу.
- `--strict`: Строгий режим аналізу (додаткові перевірки та обмеження).
- `--depth=2`: Глибина аналізу для піддиректорій.
- `--include="**/*.ts"`: Включення лише файлів з розширенням `.ts` для аналізу.
- `--exclude="node_modules"`: Виключення директорії 

node_modules

 з аналізу для прискорення процесу.

## Приклад запуску:

```bash
node src/main.js analyze ./ --recursive \
  --types=basic:confidence=80:impact=70:priority=75,\
security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80,\
breakpoint:confidence=80:impact=70:priority=75,\
imports:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --format \
  --metrics \
  --strict \
  --depth=2 \
  --include="**/*.ts" \
  --exclude="node_modules"
```

## Пояснення:

1. **Рекурсивний аналіз:** Команда аналізуватиме всі файли у вказаному каталозі та його підкаталогах, за винятком 

node_modules

, що допомагає уникнути непотрібних перевірок і скорочує час аналізу.

2. **Типи аналізу з метриками:**
   - **Basic:** Основний аналіз коду з конфіденційністю 80%, впливом 70% та пріоритетом виправлення 75%.
   - **Security:** Аналіз безпеки з високими метриками конфіденційності 90%, впливу 80% та пріоритету виправлення 85%.
   - **Performance:** Аналіз продуктивності з конфіденційністю 85%, впливом 75% та пріоритетом виправлення 80%.
   - **Breakpoint:** Аналіз точок зупинки з конфіденційністю 80%, впливом 70% та пріоритетом виправлення 75%.
   - **Imports:** Аналіз імпортів з конфіденційністю 85%, впливом 75% та пріоритетом виправлення 80%.

3. **Автоматичне застосування виправлень:** Виправлення будуть застосовані автоматично, якщо впевненість аналізу перевищує 80%.

4. **Автоматичне форматування:** Код буде автоматично відформатовано за допомогою налаштованих інструментів форматування (наприклад, Prettier).

5. **Виведення метрик:** Команда надасть детальні метрики аналізу, що допоможуть оцінити якість, безпеку та продуктивність коду.

6. **Строгий режим:** Увімкнення різних перевірок та обмежень для забезпечення високої якості коду.

7. **Глибина аналізу:** Обмеження глибини аналізу до 2 рівнів піддиректорій для оптимізації процесу.

8. **Фільтрація файлів:**
   - **Include:** Аналізуватимуться лише файли з розширенням `.ts`.
   - **Exclude:** Директорія 

node_modules

 буде виключена з аналізу.

## Рекомендації:

- **Перевірка та налаштування:** Перед запуском переконайтесь, що всі залежності встановлені (`npm install`), файл 

.env

 налаштований з необхідним API ключем, та скрипт 

setup-env.sh

 виконаний.

- **Оновлення інструментів:** Переконайтесь, що глобально встановлені інструменти (`prettier`, `eslint`, `typescript`) оновлені до останніх версій для забезпечення сумісності та найновіших можливостей.

- **Використання віртуального середовища:** Рекомендується використовувати віртуальне середовище для ізоляції залежностей проекту:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  ```

- **Регулярний аналіз:** Впровадьте регулярний запуск цього аналізу в процес розробки (наприклад, як частину CI/CD), щоб забезпечити постійну якість коду.

- **Документація та коментарі:** Додавайте докладні коментарі та документацію до коду для полегшення його розуміння та підтримки.

## Завершення

Ця команда забезпечить всебічний аналіз вашого проекту, допомагаючи виявити та виправити потенційні проблеми в коді, підвищити його якість, безпеку та продуктивність. Використовуйте надані рекомендації для подальшого покращення процесу аналізу та підтримки високих стандартів кодування.
```

Отчет по результатам анализа кода можно найти в консоли, где вы запускали команду. Ваша команда для анализа выглядела следующим образом:

```bash
node src/main.js analyze ./src \
  --recursive \
  --security:confidence=90:impact=80:priority=85 \
  --performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply
```

### Где искать отчет:

1. **Консольный вывод:**
   - Основной отчет по результатам анализа выводится непосредственно в консоль, где вы запускали команду. Проверьте вывод в терминале для детального отчета.

2. **Лог-файлы (если настроены):**
   - Если в вашем проекте настроено логирование результатов анализа в файл, проверьте соответствующий лог-файл. Обычно такие файлы могут находиться в директории `logs` или аналогичной.

3. **Файлы отчетов (если настроены):**
   - В некоторых проектах результаты анализа могут сохраняться в виде файлов отчетов (например, JSON или HTML). Проверьте директории, такие як `reports` или `output`, если такие существуют в вашем проекте.

### Пример команды для сохранения отчета в файл:

Если вы хотите сохранить отчет в файл, вы можете перенаправить вывод команды в файл следующим образом:

```bash
node src/main.js analyze ./src \
  --recursive \
  --security:confidence=90:impact=80:priority=85 \
  --performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply > analysis_report.txt
```

После выполнения этой команды отчет будет сохранен в файл `analysis_report.txt` в текущей директории.

### Пример команды для логирования в файл:

Если ваш инструмент анализа поддерживает логирование в файл, вы можете настроить это в конфигурационном файле или передать соответствующий параметр командной строки. Например:

```bash
node src/main.js analyze ./src \
  --recursive \
  --security:confidence=90:impact=80:priority=85 \
  --performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --log-file=analysis_report.json
```

В этом примере отчет будет сохранен в файл `analysis_report.json`.

### Итог:

Основной отчет по результатам анализа выводится в консоль. Если вы хотите сохранить отчет в файл, перенаправьте вывод команды в файл или используйте параметры для логирования, если они поддерживаются вашим инструментом анализа.

### Параметры анализа

#### `--metrics`

**Описание:**
- Включает метрики анализа, предоставляя детальную статистику о качестве, безопасности и производительности кода.

**Пример использования:**
```bash
node src/main.js analyze ./src --metrics
```

**Что это делает:**
- При включении этого параметра инструмент анализа собирает и выводит дополнительные данные о коде, такі як количество обнаруженных проблем, их типы, уровни уверенности и влияния, а также другие показатели, которые помогают оценить общее состояние кода.

**Преимущества:**
- Позволяет получить более полное представление о состоянии кода.
- Полезно для мониторинга улучшений и выявления областей, требующих внимания.

#### `--strict`

**Описание:**
- Включает строгий режим анализа, добавляя дополнительные проверки и ограничения для обеспечения высокого качества кода.

**Пример использования:**
```bash
node src/main.js analyze ./src --strict
```

**Что это делает:**
- В строгом режиме инструмент анализа выполняет более тщательные проверки, включая дополнительные правила и стандарты, которые могут быть пропущены в обычном режиме.
- Это может включать более строгие правила линтинга, дополнительные проверки безопасности и производительности, а также другие меры для обеспечения высокого качества кода.

**Преимущества:**
- Обеспечивает более высокий уровень качества кода.
- Помогает выявить и устранить более тонкие і сложные проблемы, которые могут быть пропущены в обычном режиме.

#### `--depth=2`

**Описание:**
- Устанавливает глубину анализа до 2 уровней поддиректорий.

**Пример использования:**
```bash
node src/main.js analyze ./src --depth=2
```

**Что это делает:**
- Ограничивает рекурсивный анализ указанной глубиной. В данном случае анализ будет выполнен только для файлов в указанной директории и её поддиректориях до второго уровня включительно.

**Преимущества:**
- Позволяет контролировать объем анализируемого кода, что может быть полезно для больших проектов.
- Сокращает время анализа, ограничивая его только наиболее важными частями проекта.

### Пример команды с использованием всех параметров

```bash
node src/main.js analyze ./src \
  --recursive \
  --types=basic:confidence=80:impact=70:priority=75,\
security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80,\
breakpoint:confidence=80:impact=70:priority=75,\
imports:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --format \
  --metrics \
  --strict \
  --depth=2 \
  --include="**/*.ts" \
  --exclude="node_modules" \
  --log-file=analysis_report.json
```

### Итог

- **`--metrics`**: Включает сбор и вывод дополнительных метрик анализа.
- **`--strict`**: Включает строгий режим анализа с дополнительными проверками і ограничениями.
- **`--depth=2`**: Ограничивает глубину рекурсивного анализа до 2 уровней поддиректорий.

```
Эти параметры помогают сделать анализ кода более детальным і точным, обеспечивая высокое качество і безопасность вашего проекта.

node src/main.js analyze ./src \
  --recursive \
  --types=syntax:confidence=95:impact=60:priority=70 \
  --format \
  --depth=2 \
  --include="**/*.ts" \
  --exclude="node_modules" \
  --log-file=syntax_analysis_report.json

### Доступные типы анализа

- `--basic` - Базовый анализ синтаксиса и стиля.
- `--security` - Анализ на уязвимости безопасности.
- `--performance` - Анализ производительности и оптимизации.
  --depth=2 \
- `--breakpoint` - Анализ точек останова для выявления причин остановки, зависания или сбоя программы.
- `--imports` - Анализ импортируемых модулей, их внешних или внутренних зависимостей, а також перевірка встановлених залежностей і бібліотек.

Пример использования с новыми типами:

```bash
node src/main.js analyze scripts/project-structure.ts --types=basic,security,performance,breakpoint,imports
```
  --include="**/*.ts" \
  --exclude="node_modules" \
  --log-file=syntax_analysis_report.json

### Доступные типы анализа

- `--basic` - Базовый анализ синтаксиса и стиля.
- `--security` - Анализ на уязвимости безопасности.
- `--performance` - Анализ производительности и оптимизации.
- `--breakpoint` - Анализ точек останова для выявления причин остановки, зависания или сбоя программы.
- `--imports` - Анализ импортируемых модулей, их внешних или внутренних зависимостей, а також перевірка встановлених залежностей і бібліотек.

Пример использования с новыми типами:

```bash
node src/main.js analyze scripts/project-structure.ts --types=basic,security,performance,breakpoint,imports
```

node src/main.js analyze scripts/project-structure.ts --types=imports:confidence=85:impact=75:priority=80,breakpoint:confidence=80:impact=70:priority=75 --fix=70 --auto-apply --format --metrics --strict --log-file=analysis_report757465.json



node src/main.js analyze ./tsrc \
  --recursive \
  --types=basic:confidence=80:impact=70:priority=75,\
security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80,\
syntax:confidence=95:impact=60:priority=70,\
imports:confidence=85:impact=75:priority=80,\
breakpoint:confidence=80:impact=70:priority=75 \
  --fix=70 \
  --auto-apply \
  --format \
  --metrics \
  --strict \
  --depth=2 \
  --exclude="node_modules" \
  --log-file=analysis_report.json


  node src/main.js analyze ./tsrc \
  --recursive \
  --types=basic:confidence=80:impact=70:priority=75,\
security:confidence=90:impact=80:priority=85,\
performance:confidence=85:impact=75:priority=80,\
syntax:confidence=95:impact=60:priority=70,\
imports:confidence=85:impact=75:priority=80,\
breakpoint:confidence=80:impact=70:priority=75 \
  --fix=70 \
  --auto-apply \
  --format \
  --metrics \
  --strict \
  --depth=2 \
  --exclude="node_modules" \
  --log-file=analysis_report.json