# ERA - Enhanced Refactoring Assistant

## 📋 Зміст
- [Встановлення](#встановлення)
- [Налаштування](#налаштування)
- [Базове використання](#базове-використання)
- [Розширені можливості](#розширені-можливості)
- [Приклади використання](#приклади-використання)
- [Усунення несправностей](#усунення-несправностей)

## 🚀 Встановлення

1. Клонуйте репозиторій:
```sh
git clone https://github.com/yourusername/ERA.git
cd ERA
```

2. Встановіть залежності:
```sh
npm install
```

3. Запустіть Dev Container:
   - Відкрийте репозиторій в VSCode.
   - Після запиту, виберіть `Reopen in Container`.

4. Глобальна установка форматтерів:
```sh
yarn global add prettier eslint typescript
```

## ⚙️ Налаштування

1. Створіть файл `.env`:
```env
GEMINI_API_KEY=your_api_key_here
DEBUG=false                  # Опціонально для додаткового логування
MAX_TOKENS=2048             # Опціонально для обмеження розміру відповіді
```

2. Перевірте налаштування:
```sh
node src/main.js verify
```

## 📘 Базове використання

### Аналіз коду

```sh
# Базовий аналіз директорії
node src/main.js analyze ./src

# Рекурсивний аналіз
node src/main.js analyze ./src --recursive

# Аналіз з автоматичним виправленням
node src/main.js analyze ./src --fix=75 --auto-apply
```

### Розширений аналіз коду

```bash
# Повний аналіз проекту з метриками
node src/main.js analyze ./src --recursive \
  --types=--security:confidence=90:impact=80:priority=85,\
  --perf:confidence=85:impact=75:priority=80,\
  --complexity:confidence=80:impact=70:priority=75,\
  --basic:confidence=75:impact=65:priority=70,\
  --structure:confidence=70:impact=60:priority=65 \
  --fix=100 --auto-apply

# Швидкий аналіз окремого файлу
node src/main.js analyze ./src/main.js \
  --types=--basic:confidence=75 \
  --fix=80

# Глибокий аналіз з перевіркою безпеки та продуктивності
node src/main.js analyze ./src --types=deep:confidence=95,security:confidence=90,perf:confidence=85,complexity:confidence=80,structure:confidence=75 \
  --fix=100 --auto-apply
```

### Інтерактивний режим

```sh
# Запуск в інтерактивному режимі
node src/main.js --interactive

# Інтерактивний режим з додатковими метриками
node src/main.js --interactive --metrics
```

## 🛠 Розширені можливості

### Типи аналізу

- `--basic` - Базовий аналіз коду
- `--security` - Перевірка безпеки
- `--performance` - Аналіз продуктивності
- `--complexity` - Аналіз складності
- `--style` - Перевірка стилю коду

### Метрики аналізу

```sh
# Формат: --type:confidence=X:impact=Y:priority=Z
node src/main.js analyze ./src --security:confidence=90:impact=80:priority=85
```

### Параметри аналізу

```bash
# Формат метрик
--types=TYPE:confidence=N:impact=N:priority=N

# Доступні типи аналізу
--basic        # Базовий аналіз
--security     # Безпека
--perf         # Продуктивність
--complexity   # Складність
--structure    # Структура коду
```

### Параметри виправлень

- `--fix=N` - Поріг впевненості (0-100)
- `--auto-apply` - Автоматичне застосування
- `--backup` - Створення резервних копій
- `--dry-run` - Тестовий прогін без змін

## 💡 Приклади використання

### Сценарій 1: Повний аналіз проекту
```sh
node src/main.js analyze ./src \
  --recursive \
  --security:confidence=90:impact=80:priority=85 \
  --performance:confidence=85:impact=75:priority=80 \
  --fix=80 \
  --auto-apply \
  --backup
```

### Сценарій 2: Швидка перевірка файлу
```sh
node src/main.js analyze ./src/main.js \
  --basic \
  --style \
  --fix=70
```

### Сценарій 3: Інтерактивний аналіз
```sh
node src/main.js analyze ./src \
  --interactive \
  --metrics \
  --depth=2
```

## ❗ Усунення несправностей

### Поширені помилки

1. **API Key не знайдено**
   ```sh
   export GEMINI_API_KEY=your_key_here
   ```

2. **Помилка доступу до файлів**
   ```sh
   chmod +x src/main.js
   ```

3. **Проблеми з пам'яттю**
   ```sh
   node --max-old-space-size=4096 src/main.js
   ```

### Debugging

```sh
DEBUG=true node src/main.js analyze ./src
```

## 📝 Примітки

- Рекомендується робити резервні копії перед масовими змінами
- Використовуйте `--dry-run` для перевірки змін
- Налаштуйте `.gitignore` для виключення тимчасових файлів

## 🔄 Оновлення

```sh
git pull
npm install
```

## Настройка API ключа

Для безопасного хранения API ключа Gemini:

1. Добавьте ключ в системные переменные:
```bash
echo "export GEMINI_API_KEY=ваш_ключ" >> ~/.bashrc
source ~/.bashrc
```

2. Или создайте .env файл:
```bash
GEMINI_API_KEY=ваш_ключ
DEBUG=true
```

**Важно:** Никогда не коммитьте .env файл в репозиторий!
