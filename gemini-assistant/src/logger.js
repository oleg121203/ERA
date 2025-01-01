const logger = {
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require("readline");
const fs = require("fs").promises;
const path = require("path");
const logger = require('./logger');
require("dotenv").config();

// Добавить в начало файла после импортов
const processArgs = process.argv.slice(2);

// Добавляем валидацию входных данных
function validatePath(path) {
  if (!path || typeof path !== "string") {
    throw new Error("Путь должен быть строкой");
  }
  if (path.includes("..")) {
    throw new Error('Путь не должен содержать ".."');
  }
  return path.trim();
}

function validateCode(code) {
  if (!code || typeof code !== "string") {
    throw new Error("Код должен быть строкой");
  }
  if (code.length < 1) {
    throw new Error("Код не может быть пустым");
  }
  return code.trim();
}

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Обновляем helpCommands с дополнительными примерами
const helpCommands = {
  "/help": {
    desc: "Показать список команд",
    examples: [
      "'/help' - показать все доступные команды",
      "'/help code' - информация о команде code",
      "'/help analyze' - информация об анализе кода",
    ],
  },
  "/code": {
    desc: "Режим генерации кода",
    examples: [
      "'/code' - создать новый код",
      "Примеры заданий:",
      "- Python: class User with authentication",
      "- JavaScript: async function for API calls",
      "- TypeScript: interface for User model",
      "- React: component for data table",
      "- Node.js: Express middleware for logging",
    ],
  },
  "/explain": {
    desc: "Объяснить концепцию",
    examples: [
      "'/explain' - получить объяснение",
      "Примеры тем:",
      "- JavaScript: Promise, async/await, closure",
      "- React: hooks, virtual DOM, lifecycle",
      "- Node.js: event loop, streams, buffers",
      "- TypeScript: generics, unions, decorators",
      "- Python: generators, decorators, context managers",
    ],
  },
  "/analyze": {
    desc: "Анализ кода на ошибки",
    examples: [
      "'/analyze' - начать анализ кода",
      "Поддерживает:",
      "- Ручной ввод кода",
      "- Анализ файла",
      "- Анализ папки",
    ],
  },
  "/exit": {
    desc: "Выход в главное меню",
    examples: ["'/exit' - вернуться в меню"],
  },
  "/analyze-batch": {
    desc: "Пакетный анализ файлов с указанием проверок",
    examples: [
      "'/analyze-batch' - запустить пакетный анализ",
      "Примеры использования:",
      "- ./src/**/*.js --basic --perf",
      "- ./src/main.js,./tests/*.js --all",
      "- ./project --deep --sec",
      "Доступные флаги:",
      "--all: все проверки",
      "--basic: базовый анализ",
      "--deep: глубокий анализ",
      "--perf: производительность",
      "--sec: безопасность",
      "--doc: документация",
    ],
  },
};

async function showHelp() {
  logger.info("\n=== 📚 Справка по командам ===");
  Object.entries(helpCommands).forEach(([cmd, info]) => {
    logger.info(`\n${cmd}: ${info.desc}`);
    logger.info("Примеры использования:");
    info.examples.forEach((ex) => logger.info(`  ${ex}`));
  });
  logger.info(
    "\nПримечание: Команды работают как с префиксом в начале (/help), так и в конце (help/)"
  );
}

async function handleCodeGeneration(chat) {
  logger.info("\n=== Режим генерации кода ===");
  logger.info("Укажите язык и опишите что нужно создать");

  const prompt = await promptUser("🖥️ Задание: ");
  const result = await chat.sendMessage(`Generate code: ${prompt}`);
  logger.info("\n```\n" + result.response.text() + "\n```\n");
}

async function getAllFiles(dirPath) {
  const files = [];

  async function scan(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await scan(dirPath);
  return files;
}

// Добавляем функцию для получения текущего пути
async function getCurrentDirectory() {
  return process.cwd();
}

// Обновляем функцию для обработки путей
async function resolvePath(inputPath) {
  if (!inputPath) {
    return process.cwd();
  }

  // Если путь относительный, делаем его абсолютным
  if (!path.isAbsolute(inputPath)) {
    return path.resolve(process.cwd(), inputPath);
  }
  return inputPath;
}

const analyzeCommands = {
  basic: {
    desc: "Базовый анализ кода",
    sections: ["Синтаксис", "Импорты", "Структура", "Стиль", "Безопасность"],
  },
  deep: {
    desc: "Глубокий анализ кода",
    sections: [
      "Синтаксис",
      "Импорты",
      "Структура",
      "Стиль",
      "Безопасность",
      "Производительность",
      "Масштабируемость",
      "Тестируемость",
    ],
  },
  perf: {
    desc: "Анализ производительности",
    sections: ["Алгоритмы", "Память", "Циклы", "Кэширование", "Асинхронность"],
  },
  sec: {
    desc: "Анализ безопасности",
    sections: ["Уязвимости", "Валидация", "Защита данных", "Конфигурация"],
  },
  doc: {
    desc: "Проверка документации",
    sections: ["Комментарии", "JSDoc", "README", "Примеры", "Инструкции"],
  },
};

async function handleCodeAnalysis(chat) {
  try {
    logger.info("\n=== Режим анализа кода ===");
    logger.info("Выберите тип анализа:");
    Object.entries(analyzeCommands).forEach(([cmd, info], index) => {
      logger.info(`${index + 1}. ${cmd}: ${info.desc}`);
    });

    const analysisType = await promptUser("\nВыберите тип анализа (1-5): ");
    const selectedCommand =
      Object.keys(analyzeCommands)[parseInt(analysisType) - 1];

    if (!selectedCommand) {
      throw new Error("Неверный выбор типа анализа");
    }

    logger.info(`\nВыбран анализ: ${analyzeCommands[selectedCommand].desc}`);
    logger.info("Выберите источник кода:");
    logger.info("1. Ввести код вручную");
    logger.info("2. Указать путь к файлу");
    logger.info("3. Указать путь к папке (рекурсивно)");
    logger.info("4. Выбрать несколько файлов");

    const currentDir = await getCurrentDirectory();
    logger.info(`\nТекущая папка: ${currentDir}`);
    logger.info("Подсказка: Можно использовать:");
    logger.info("- Абсолютный путь (/home/user/project)");
    logger.info("- Относительный путь (./src или ../project)");
    logger.info("- Только имя папки для текущей директории\n");

    const choice = await promptUser("Выберите опцию (1-4): ");
    if (!["1", "2", "3", "4"].includes(choice)) {
      throw new Error("Неверный выбор опции");
    }

    let files = [];
    let code = "";

    switch (choice) {
      case "1":
        code = validateCode(await promptUser("📝 Введите код: "));
        break;
      case "2":
        const filePath = validatePath(await promptUser("📂 Путь к файлу: "));
        const resolvedFilePath = await resolvePath(filePath);
        await validateFileAccess(resolvedFilePath);
        files = [resolvedFilePath];
        break;
      case "3":
        const dirPath = await promptUser("📁 Укажите путь к папке: ");
        const resolvedDirPath = await resolvePath(dirPath);
        logger.info(`\nПолный путь: ${resolvedDirPath}`);

        try {
          // Проверяем существование директории
          await fs.access(resolvedDirPath);
          files = await getAllFiles(resolvedDirPath);

          if (files.length === 0) {
            logger.info("⚠️ В указанной папке нет файлов");
            return;
          }

          logger.info("\nНайденные файлы:");
          files.forEach((file, index) => {
            // Показываем относительный путь для удобства
            const relativePath = path.relative(resolvedDirPath, file);
            logger.info(`${index + 1}. ${relativePath}`);
          });

          const shouldAnalyzeAll =
            (
              await promptUser("Анализировать все файлы? (y/n): ")
            ).toLowerCase() === "y";

          if (!shouldAnalyzeAll) {
            const selectedIndexes = (
              await promptUser("Введите номера файлов через запятую: ")
            ).split(",");
            files = selectedIndexes.map((i) => files[parseInt(i.trim()) - 1]);
          }
        } catch (error) {
          if (error.code === "ENOENT") {
            logger.error(`❌ Папка не найдена: ${resolvedDirPath}`);
          } else {
            logger.error(`❌ Ошибка сканирования: ${error.message}`);
          }
          return;
        }
        break;
      case "4":
        const filePaths = (
          await promptUser("📂 Укажите пути к файлам через запятую: ")
        ).split(",");
        files = filePaths.map((p) => p.trim());
        break;
      default:
        logger.error("❌ Неверный выбор");
        return;
    }

    const shouldAutofix =
      (
        await promptUser("🔧 Включить автоисправление? (y/n): ")
      ).toLowerCase() === "y";

    const analysisPrompt = `
      Выполни ${
        analyzeCommands[selectedCommand].desc
      } и предоставь детальный отчет.
      Проверь следующие аспекты:
      ${analyzeCommands[selectedCommand].sections
        .map((s) => `- ${s}`)
        .join("\n")}
      
      ${fileName ? `\nФайл: ${fileName}` : ""}
      
      Код:
      ${code}
      
      Предоставь структурированный отчет с оценкой по каждому критерию.
    `;

    logger.info(
      `\n⏳ Выполняю ${analyzeCommands[selectedCommand].desc.toLowerCase()}...`
    );
    const result = await chat.sendMessage(analysisPrompt);
    logger.info("\n📊 Результаты анализа:\n" + result.response.text() + "\n");

    // Добавляем специфичные проверки для каждого типа анализа
    if (selectedCommand === "perf") {
      await analyzePerformance(chat, code);
    } else if (selectedCommand === "sec") {
      await analyzeSecurityIssues(chat, code);
    }

    if (shouldAutofix) {
      await generateFixes(chat, code, selectedCommand);
    }
  } catch (error) {
    logger.error(`❌ Ошибка: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      logger.error("Stack trace:", error.stack);
    }
  }
}

async function analyzePerformance(chat, code) {
  const perfPrompt = `
    Проведи детальный анализ производительности кода:
    1. Оценка временной сложности (Big O)
    2. Поиск узких мест
    3. Проверка оптимизации циклов
    4. Анализ использования памяти
    5. Рекомендации по оптимизации
    
    Код: ${code}
  `;

  const result = await chat.sendMessage(perfPrompt);
  logger.info("\n⚡ Анализ производительности:\n" + result.response.text());
}

async function analyzeSecurityIssues(chat, code) {
  const securityPrompt = `
    Проведи анализ безопасности кода:
    1. Поиск уязвимостей
    2. Проверка валидации входных данных
    3. Анализ обработки ошибок
    4. Проверка защиты данных
    5. Рекомендации по улучшению
    
    Код: ${code}
  `;

  const result = await chat.sendMessage(securityPrompt);
  logger.info("\n🔒 Анализ безопасности:\n" + result.response.text());
}

// Добавляем проверку доступа к файлу
async function validateFileAccess(filepath) {
  try {
    await fs.access(filepath, fs.constants.R_OK);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Файл не найден: ${filepath}`);
    }
    if (error.code === "EACCES") {
      throw new Error(`Нет доступа к файлу: ${filepath}`);
    }
    throw error;
  }
}

async function analyzeCode(chat, code, shouldAutofix, fileName = "") {
  try {
    code = validateCode(code);

    const analysisPrompt = `
      Выполни комплексный анализ кода и предоставь детальный отчет по всем критериям:

      1. СИНТАКСИС И БАЗОВЫЕ ПРОВЕРКИ:
         - Синтаксические ошибки
         - Типографические ошибки
         - Форматирование кода
         - Отступы и пробелы
         - Парные символы (скобки, кавычки)

      2. ИМПОРТЫ И ЗАВИСИМОСТИ:
         - Проверка корректности импортов
         - Неиспользуемые импорты
         - Отсутствующие зависимости
         - Конфликты версий
         - Циклические зависимости

      3. АРХИТЕКТУРА И СТРУКТУРА:
         - Организация кода
         - Разделение ответственности
         - Повторяющийся код (DRY)
         - Сложность функций
         - Глубина вложенности

      4. СТИЛЬ КОДИРОВАНИЯ:
         - Соответствие стандартам
         - Наименование переменных/функций
         - Комментарии и документация
         - Длина строк/функций
         - Единообразие стиля

      5. БЕЗОПАСНОСТЬ:
         - Уязвимости
         - Обработка ошибок
         - Валидация входных данных
         - Защита данных
         - Безопасная конфигурация

      6. ПРОИЗВОДИТЕЛЬНОСТЬ:
         - Алгоритмическая сложность
         - Утечки памяти
         - Оптимизация циклов
         - Кэширование
         - Асинхронные операции

      7. ТЕСТИРУЕМОСТЬ:
         - Модульность кода
         - Возможность мок-тестирования
         - Изоляция побочных эффектов
         - Покрытие тестами
         - Тестовые сценарии

      8. МАСШТАБИРУЕМОСТЬ:
         - Возможности расширения
         - Гибкость архитектуры
         - Повторное использование
         - Управление состоянием
         - Обработка нагрузки

      9. СОВМЕСТИМОСТЬ:
         - Кросс-браузерность
         - Версии Node.js/npm
         - Зависимости платформы
         - API совместимость
         - Обратная совместимость

      10. ДОКУМЕНТАЦИЯ:
          - Наличие комментариев
          - JSDoc/TypeDoc
          - README файлы
          - Примеры использования
          - Инструкции по развертыванию

      ${
        shouldAutofix
          ? `
      11. РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ:
          - Критические исправления
          - Рефакторинг
          - Оптимизация
          - Улучшение читаемости
          - Повышение надежности
      `
          : ""
      }

      ${fileName ? `\nАнализируемый файл: ${fileName}` : ""}
      
      Код для анализа:
      ${code}
      
      Предоставь структурированный отчет с оценкой по каждому критерию и конкретными примерами найденных проблем или рекомендаций.
    `;

    logger.info("\n⏳ Выполняю комплексный анализ кода...");
    const result = await chat.sendMessage(analysisPrompt);
    logger.info("\n📊 Результаты анализа:\n" + result.response.text() + "\n");

    if (shouldAutofix) {
      const fixPrompt = `
        На основе проведенного анализа, выполни следующие улучшения кода:
        1. Исправь все найденные ошибки
        2. Оптимизируй производительность
        3. Улучши читаемость и поддерживаемость
        4. Добавь необходимые комментарии
        5. Примени лучшие практики

        Исходный код:
        ${code}
        
        Верни улучшенную версию с комментариями по внесенным изменениям.
      `;

      logger.info("\n⏳ Генерирую улучшенную версию кода...");
      const fixResult = await chat.sendMessage(fixPrompt);
      logger.info("\n🔧 Улучшенный код:\n" + fixResult.response.text() + "\n");
    }
  } catch (error) {
    logger.error(`❌ Ошибка анализа: ${error.message}`);
    throw error;
  }
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Добавляем функцию для парсинга аргументов анализа
function parseAnalysisArgs(input) {
  const args = input.split(" ");
  const paths = [];
  const checks = new Set();

  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const check = arg.slice(2);
      if (check === "all") {
        Object.keys(analyzeCommands).forEach((cmd) => checks.add(cmd));
      } else if (analyzeCommands[check]) {
        checks.add(check);
      }
    } else {
      paths.push(arg);
    }
  });

  return {
    paths: paths.length > 0 ? paths[0].split(",") : [],
    checks: Array.from(checks),
  };
}

// Обновленная функция parseCLIArgs
function parseCLIArgs(args) {
  if (!args || args.length === 0) {
    return null;
  }

  const command = args[0];
  const options = {
    paths: [],
    checks: new Set(),
    autofix: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);
      if (flag === "autofix") {
        options.autofix = true;
      } else if (flag === "all") {
        Object.keys(analyzeCommands).forEach((cmd) => options.checks.add(cmd));
      } else if (analyzeCommands[flag]) {
        options.checks.add(flag);
      }
    } else {
      options.paths.push(arg);
    }
  }

  return {
    command,
    options: {
      ...options,
      checks: Array.from(options.checks),
    },
  };
}

// Добавляем функцию для отображения прогресса
function showProgress(current, total, label = "Прогресс") {
  const width = 30;
  const progress = Math.round((current / total) * width);
  const percentage = Math.round((current / total) * 100);

  const bar = "█".repeat(progress) + "░".repeat(width - progress);
  logger.info(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);
}

// Обновляем функцию analyzeFile с подробным выводом
async function analyzeFile(chat, filePath, checks, shouldAutofix) {
  try {
    logger.info(`\n📄 Анализ файла: ${filePath}`);
    const code = await fs.readFile(filePath, "utf8");

    logger.info("\nСтатистика файла:");
    logger.info(`- Размер: ${(code.length / 1024).toFixed(2)} KB`);
    logger.info(`- Строк кода: ${code.split("\n").length}`);

    const results = {
      issues: 0,
      warnings: 0,
      suggestions: 0,
    };

    logger.info("\nЗапланированные проверки:");
    checks.forEach((check) => {
      logger.info(`✓ ${analyzeCommands[check].desc}`);
    });

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      showProgress(i + 1, checks.length, "Выполнение проверок");

      logger.info(`\n⚡ Выполняется ${analyzeCommands[check].desc}...`);

      if (check === "perf") {
        await analyzePerformance(chat, code);
      } else if (check === "sec") {
        await analyzeSecurityIssues(chat, code);
      } else {
        const result = await chat.sendMessage(`
          Выполни ${analyzeCommands[check].desc} для файла ${path.basename(
          filePath
        )}:
          ${analyzeCommands[check].sections.map((s) => `- ${s}`).join("\n")}
          
          Код:
          ${code}

          Формат ответа:
          {
            "issues": [список критических проблем],
            "warnings": [список предупреждений],
            "suggestions": [список рекомендаций],
            "analysis": "детальный анализ"
          }
        `);

        // Парсим результат и обновляем статистику
        const analysisResult = result.response.text();
        try {
          const parsed = JSON.parse(analysisResult);
          results.issues += parsed.issues?.length || 0;
          results.warnings += parsed.warnings?.length || 0;
          results.suggestions += parsed.suggestions?.length || 0;
        } catch {
          logger.info("\nРезультаты:", analysisResult);
        }
      }
    }

    // Выводим итоговую статистику
    logger.info("\n📊 Итоги анализа:");
    logger.info(`- Критические проблемы: ${results.issues}`);
    logger.info(`- Предупреждения: ${results.warnings}`);
    logger.info(`- Рекомендации: ${results.suggestions}`);

    if (shouldAutofix) {
      logger.info("\n🔧 Генерация исправлений...");
      await generateFixes(chat, code, "all");
    }
  } catch (error) {
    logger.error(`❌ Ошибка анализа файла ${filePath}:`, error.message);
  }
}

// Обновляем функцию handleBatchAnalysis
async function handleBatchAnalysis(chat, cliArgs = null) {
  try {
    let paths = [];
    let checks = [];
    let shouldAutofix = false;

    if (cliArgs) {
      logger.info("Анализ аргументов командной строки...");
      const parseResult = parseCLIArgs(cliArgs.split(" "));
      if (!parseResult) {
        throw new Error("Некорректные аргументы командной строки");
      }
      const { options } = parseResult;
      paths = options.paths;
      checks = options.checks;
      shouldAutofix = options.autofix || false;

      // Проверка на пустые пути
      if (paths.length === 0) {
        throw new Error("Не указаны пути для анализа");
      }

      logger.info(`Найдено путей: ${paths.length}`);
      logger.info(`Выбранные проверки: ${checks.join(", ")}`);
      logger.info(
        `Автоисправление: ${shouldAutofix ? "включено" : "выключено"}`
      );
    }

    // Сканируем файлы
    logger.info("Сканирование файловой системы...", "progress");
    let allFiles = [];

    for (const pathPattern of paths) {
      logger.info(`Обработка пути: ${pathPattern}`);
      const resolvedPath = await resolvePath(pathPattern);
      logger.info(`Полный путь: ${resolvedPath}`);

      try {
        const stats = await fs.stat(resolvedPath);

        if (stats.isDirectory()) {
          logger.info(`Сканирование директории ${resolvedPath}...`);
          const files = await getAllFiles(resolvedPath);
          allFiles = allFiles.concat(files);
          logger.info(`Найдено файлов в директории: ${files.length}`);
        } else {
          allFiles.push(resolvedPath);
          logger.info(`Добавлен файл: ${resolvedPath}`);
        }
      } catch (error) {
        logger.error(`Ошибка обработки пути ${pathPattern}: ${error.message}`);
      }
    }

    if (allFiles.length === 0 && paths.length > 0) {
      throw new Error("Не найдено файлов для анализа");
    }

    logger.info(`\nВсего найдено файлов: ${allFiles.length}`, "success");

    // Анализируем файлы
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      logger.info( 
        `\nАнализ файла (${i + 1}/${allFiles.length}): ${file}`,
        "progress"
      );
      await analyzeFile(chat, file, checks, shouldAutofix);
    }

    logger.info("\nПакетный анализ завершен", "success");
  } catch (error) {
    logger.error(error.message, "error");
    if (process.env.DEBUG === 'true') {
      logger.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Добавляем вспомогательную функцию для анализа файла
async function analyzeFile(chat, filePath, checks, shouldAutofix) {
  try {
    const fileStats = await fs.stat(filePath);
    const code = await fs.readFile(filePath, "utf8");

    logger.info("\nСтатистика файла:");
    logger.info(`- Имя: ${path.basename(filePath)}`);
    logger.info(`- Размер: ${(fileStats.size / 1024).toFixed(2)} KB`);
    logger.info(`- Строк кода: ${code.split("\n").length}`);
    logger.info(`- Последнее изменение: ${fileStats.mtime}`);

    const results = {
      issues: 0,
      warnings: 0,
      suggestions: 0,
    };

    logger.info("\nЗапланированные проверки:");
    checks.forEach((check) => {
      logger.info(`✓ ${analyzeCommands[check].desc}`);
    });

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      showProgress(i + 1, checks.length, "Выполнение проверок");

      logger.info(`\n⚡ Выполняется ${analyzeCommands[check].desc}...`);

      if (check === "perf") {
        await analyzePerformance(chat, code);
      } else if (check === "sec") {
        await analyzeSecurityIssues(chat, code);
      } else {
        const result = await chat.sendMessage(`
          Выполни ${analyzeCommands[check].desc} для файла ${path.basename(
          filePath
        )}:
          ${analyzeCommands[check].sections.map((s) => `- ${s}`).join("\n")}
          
          Код:
          ${code}

          Формат ответа:
          {
            "issues": [список критических проблем],
            "warnings": [список предупреждений],
            "suggestions": [список рекомендаций],
            "analysis": "детальный анализ"
          }
        `);

        // Парсим результат и обновляем статистику
        const analysisResult = result.response.text();
        try {
          const parsed = JSON.parse(analysisResult);
          results.issues += parsed.issues?.length || 0;
          results.warnings += parsed.warnings?.length || 0;
          results.suggestions += parsed.suggestions?.length || 0;
        } catch {
          logger.info("\nРезультаты:", analysisResult);
        }
      }
    }

    // Выводим итоговую статистику
    logger.info("\n📊 Итоги анализа:");
    logger.info(`- Критические проблемы: ${results.issues}`);
    logger.info(`- Предупреждения: ${results.warnings}`);
    logger.info(`- Рекомендации: ${results.suggestions}`);

    if (shouldAutofix) {
      logger.info("\n🔧 Генерация исправлений...");
      await generateFixes(chat, code, "all");
    }
  } catch (error) {
    logger.error(`Ошибка анализа файла ${filePath}: ${error.message}`, "error");
  }
}

// Обновляем main для корректной обработки CLI
async function main() {
  try {
    if (processArgs.length > 0) {
      const { command, options } = parseCLIArgs(processArgs);

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const chat = model.startChat({
        generationConfig: { maxOutputTokens: 2048 },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      switch (command) {
        case "analyze-batch":
          await handleBatchAnalysis(chat, processArgs.slice(1).join(" "));
          break;
        case "analyze":
          if (options.paths.length === 1) {
            const code = await fs.readFile(options.paths[0], "utf8");
            await analyzeCode(
              chat,
              code,
              options.autofix,
              path.basename(options.paths[0])
            );
          }
          break;
        case "help":
          await showHelp();
          break;
        default:
          logger.error("❌ Неизвестная команда:", command);
          process.exit(1);
      }
      rl.close();
      return;
    }

    // Интерактивный режим
    logger.info("\n🤖 Добро пожаловать в Gemini AI Assistant!");

    while (true) {
      logger.info("\n=== Главное меню ===");
      logger.info("1. 💭 Chat режим");
      logger.info("2. 🚀 Прямой запрос");
      logger.info("3. 👋 Выход");

      const choice = await promptUser("\nВыберите режим (1-3): ");

      switch (choice) {
        case "1":
          await runChat();
          break;
        case "2":
          const prompt = await promptUser("Введите ваш запрос: ");
          await makeDirectRequest(prompt);
          break;
        case "3":
          logger.info("\n👋 До свидания!");
          rl.close();
          return;
        default:
          logger.error("❌ Неверный выбор. Попробуйте снова.");
      }
    }
  } catch (error) {
    logger.error("❌ Ошибка:", error);
  } finally {
    rl.close();
  }
}

main();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require("readline");
const fs = require("fs").promises;
const path = require("path");
const logger = require('./logger');
require("dotenv").config();

// Добавить в начало файла после импортов
const processArgs = process.argv.slice(2);

// Добавляем валидацию входных данных
function validatePath(path) {
  if (!path || typeof path !== "string") {
    throw new Error("Путь должен быть строкой");
  }
  if (path.includes("..")) {
    throw new Error('Путь не должен содержать ".."');
  }
  return path.trim();
}

function validateCode(code) {
  if (!code || typeof code !== "string") {
    throw new Error("Код должен быть строкой");
  }
  if (code.length < 1) {
    throw new Error("Код не может быть пустым");
  }
  return code.trim();
}

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Обновляем helpCommands с дополнительными примерами
const helpCommands = {
  "/help": {
    desc: "Показать список команд",
    examples: [
      "'/help' - показать все доступные команды",
      "'/help code' - информация о команде code",
      "'/help analyze' - информация об анализе кода",
    ],
  },
  "/code": {
    desc: "Режим генерации кода",
    examples: [
      "'/code' - создать новый код",
      "Примеры заданий:",
      "- Python: class User with authentication",
      "- JavaScript: async function for API calls",
      "- TypeScript: interface for User model",
      "- React: component for data table",
      "- Node.js: Express middleware for logging",
    ],
  },
  "/explain": {
    desc: "Объяснить концепцию",
    examples: [
      "'/explain' - получить объяснение",
      "Примеры тем:",
      "- JavaScript: Promise, async/await, closure",
      "- React: hooks, virtual DOM, lifecycle",
      "- Node.js: event loop, streams, buffers",
      "- TypeScript: generics, unions, decorators",
      "- Python: generators, decorators, context managers",
    ],
  },
  "/analyze": {
    desc: "Анализ кода на ошибки",
    examples: [
      "'/analyze' - начать анализ кода",
      "Поддерживает:",
      "- Ручной ввод кода",
      "- Анализ файла",
      "- Анализ папки",
    ],
  },
  "/exit": {
    desc: "Выход в главное меню",
    examples: ["'/exit' - вернуться в меню"],
  },
  "/analyze-batch": {
    desc: "Пакетный анализ файлов с указанием проверок",
    examples: [
      "'/analyze-batch' - запустить пакетный анализ",
      "Примеры использования:",
      "- ./src/**/*.js --basic --perf",
      "- ./src/main.js,./tests/*.js --all",
      "- ./project --deep --sec",
      "Доступные флаги:",
      "--all: все проверки",
      "--basic: базовый анализ",
      "--deep: глубокий анализ",
      "--perf: производительность",
      "--sec: безопасность",
      "--doc: документация",
    ],
  },
};

async function showHelp() {
  logger.info("\n=== 📚 Справка по командам ===");
  Object.entries(helpCommands).forEach(([cmd, info]) => {
    logger.info(`\n${cmd}: ${info.desc}`);
    logger.info("Примеры использования:");
    info.examples.forEach((ex) => logger.info(`  ${ex}`));
  });
  logger.info(
    "\nПримечание: Команды работают как с префиксом в начале (/help), так и в конце (help/)"
  );
}

async function handleCodeGeneration(chat) {
  logger.info("\n=== Режим генерации кода ===");
  logger.info("Укажите язык и опишите что нужно создать");

  const prompt = await promptUser("🖥️ Задание: ");
  const result = await chat.sendMessage(`Generate code: ${prompt}`);
  logger.info("\n```\n" + result.response.text() + "\n```\n");
}

async function getAllFiles(dirPath) {
  const files = [];

  async function scan(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await scan(dirPath);
  return files;
}

// Добавляем функцию для получения текущего пути
async function getCurrentDirectory() {
  return process.cwd();
}

// Обновляем функцию для обработки путей
async function resolvePath(inputPath) {
  if (!inputPath) {
    return process.cwd();
  }

  // Если путь относительный, делаем его абсолютным
  if (!path.isAbsolute(inputPath)) {
    return path.resolve(process.cwd(), inputPath);
  }
  return inputPath;
}

const analyzeCommands = {
  basic: {
    desc: "Базовый анализ кода",
    sections: ["Синтаксис", "Импорты", "Структура", "Стиль", "Безопасность"],
  },
  deep: {
    desc: "Глубокий анализ кода",
    sections: [
      "Синтаксис",
      "Импорты",
      "Структура",
      "Стиль",
      "Безопасность",
      "Производительность",
      "Масштабируемость",
      "Тестируемость",
    ],
  },
  perf: {
    desc: "Анализ производительности",
    sections: ["Алгоритмы", "Память", "Циклы", "Кэширование", "Асинхронность"],
  },
  sec: {
    desc: "Анализ безопасности",
    sections: ["Уязвимости", "Валидация", "Защита данных", "Конфигурация"],
  },
  doc: {
    desc: "Проверка документации",
    sections: ["Комментарии", "JSDoc", "README", "Примеры", "Инструкции"],
  },
};

async function handleCodeAnalysis(chat) {
  try {
    logger.info("\n=== Режим анализа кода ===");
    logger.info("Выберите тип анализа:");
    Object.entries(analyzeCommands).forEach(([cmd, info], index) => {
      logger.info(`${index + 1}. ${cmd}: ${info.desc}`);
    });

    const analysisType = await promptUser("\nВыберите тип анализа (1-5): ");
    const selectedCommand =
      Object.keys(analyzeCommands)[parseInt(analysisType) - 1];

    if (!selectedCommand) {
      throw new Error("Неверный выбор типа анализа");
    }

    logger.info(`\nВыбран анализ: ${analyzeCommands[selectedCommand].desc}`);
    logger.info("Выберите источник кода:");
    logger.info("1. Ввести код вручную");
    logger.info("2. Указать путь к файлу");
    logger.info("3. Указать путь к папке (рекурсивно)");
    logger.info("4. Выбрать несколько файлов");

    const currentDir = await getCurrentDirectory();
    logger.info(`\nТекущая папка: ${currentDir}`);
    logger.info("Подсказка: Можно использовать:");
    logger.info("- Абсолютный путь (/home/user/project)");
    logger.info("- Относительный путь (./src или ../project)");
    logger.info("- Только имя папки для текущей директории\n");

    const choice = await promptUser("Выберите опцию (1-4): ");
    if (!["1", "2", "3", "4"].includes(choice)) {
      throw new Error("Неверный выбор опции");
    }

    let files = [];
    let code = "";

    switch (choice) {
      case "1":
        code = validateCode(await promptUser("📝 Введите код: "));
        break;
      case "2":
        const filePath = validatePath(await promptUser("📂 Путь к файлу: "));
        const resolvedFilePath = await resolvePath(filePath);
        await validateFileAccess(resolvedFilePath);
        files = [resolvedFilePath];
        break;
      case "3":
        const dirPath = await promptUser("📁 Укажите путь к папке: ");
        const resolvedDirPath = await resolvePath(dirPath);
        logger.info(`\nПолный путь: ${resolvedDirPath}`);

        try {
          // Проверяем существование директории
          await fs.access(resolvedDirPath);
          files = await getAllFiles(resolvedDirPath);

          if (files.length === 0) {
            logger.info("⚠️ В указанной папке нет файлов");
            return;
          }

          logger.info("\nНайденные файлы:");
          files.forEach((file, index) => {
            // Показываем относительный путь для удобства
            const relativePath = path.relative(resolvedDirPath, file);
            logger.info(`${index + 1}. ${relativePath}`);
          });

          const shouldAnalyzeAll =
            (
              await promptUser("Анализировать все файлы? (y/n): ")
            ).toLowerCase() === "y";

          if (!shouldAnalyzeAll) {
            const selectedIndexes = (
              await promptUser("Введите номера файлов через запятую: ")
            ).split(",");
            files = selectedIndexes.map((i) => files[parseInt(i.trim()) - 1]);
          }
        } catch (error) {
          if (error.code === "ENOENT") {
            logger.error(`❌ Папка не найдена: ${resolvedDirPath}`);
          } else {
            logger.error(`❌ Ошибка сканирования: ${error.message}`);
          }
          return;
        }
        break;
      case "4":
        const filePaths = (
          await promptUser("📂 Укажите пути к файлам через запятую: ")
        ).split(",");
        files = filePaths.map((p) => p.trim());
        break;
      default:
        logger.error("❌ Неверный выбор");
        return;
    }

    const shouldAutofix =
      (
        await promptUser("🔧 Включить автоисправление? (y/n): ")
      ).toLowerCase() === "y";

    const analysisPrompt = `
      Выполни ${
        analyzeCommands[selectedCommand].desc
      } и предоставь детальный отчет.
      Проверь следующие аспекты:
      ${analyzeCommands[selectedCommand].sections
        .map((s) => `- ${s}`)
        .join("\n")}
      
      ${fileName ? `\nФайл: ${fileName}` : ""}
      
      Код:
      ${code}
      
      Предоставь структурированный отчет с оценкой по каждому критерию.
    `;

    logger.info(
      `\n⏳ Выполняю ${analyzeCommands[selectedCommand].desc.toLowerCase()}...`
    );
    const result = await chat.sendMessage(analysisPrompt);
    logger.info("\n📊 Результаты анализа:\n" + result.response.text() + "\n");

    // Добавляем специфичные проверки для каждого типа анализа
    if (selectedCommand === "perf") {
      await analyzePerformance(chat, code);
    } else if (selectedCommand === "sec") {
      await analyzeSecurityIssues(chat, code);
    }

    if (shouldAutofix) {
      await generateFixes(chat, code, selectedCommand);
    }
  } catch (error) {
    logger.error(`❌ Ошибка: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      logger.error("Stack trace:", error.stack);
    }
  }
}

async function analyzePerformance(chat, code) {
  const perfPrompt = `
    Проведи детальный анализ производительности кода:
    1. Оценка временной сложности (Big O)
    2. Поиск узких мест
    3. Проверка оптимизации циклов
    4. Анализ использования памяти
    5. Рекомендации по оптимизации
    
    Код: ${code}
  `;

  const result = await chat.sendMessage(perfPrompt);
  logger.info("\n⚡ Анализ производительности:\n" + result.response.text());
}

async function analyzeSecurityIssues(chat, code) {
  const securityPrompt = `
    Проведи анализ безопасности кода:
    1. Поиск уязвимостей
    2. Проверка валидации входных данных
    3. Анализ обработки ошибок
    4. Проверка защиты данных
    5. Рекомендации по улучшению
    
    Код: ${code}
  `;

  const result = await chat.sendMessage(securityPrompt);
  logger.info("\n🔒 Анализ безопасности:\n" + result.response.text());
}

// Добавляем проверку доступа к файлу
async function validateFileAccess(filepath) {
  try {
    await fs.access(filepath, fs.constants.R_OK);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Файл не найден: ${filepath}`);
    }
    if (error.code === "EACCES") {
      throw new Error(`Нет доступа к файлу: ${filepath}`);
    }
    throw error;
  }
}

async function analyzeCode(chat, code, shouldAutofix, fileName = "") {
  try {
    code = validateCode(code);

    const analysisPrompt = `
      Выполни комплексный анализ кода и предоставь детальный отчет по всем критериям:

      1. СИНТАКСИС И БАЗОВЫЕ ПРОВЕРКИ:
         - Синтаксические ошибки
         - Типографические ошибки
         - Форматирование кода
         - Отступы и пробелы
         - Парные символы (скобки, кавычки)

      2. ИМПОРТЫ И ЗАВИСИМОСТИ:
         - Проверка корректности импортов
         - Неиспользуемые импорты
         - Отсутствующие зависимости
         - Конфликты версий
         - Циклические зависимости

      3. АРХИТЕКТУРА И СТРУКТУРА:
         - Организация кода
         - Разделение ответственности
         - Повторяющийся код (DRY)
         - Сложность функций
         - Глубина вложенности

      4. СТИЛЬ КОДИРОВАНИЯ:
         - Соответствие стандартам
         - Наименование переменных/функций
         - Комментарии и документация
         - Длина строк/функций
         - Единообразие стиля

      5. БЕЗОПАСНОСТЬ:
         - Уязвимости
         - Обработка ошибок
         - Валидация входных данных
         - Защита данных
         - Безопасная конфигурация

      6. ПРОИЗВОДИТЕЛЬНОСТЬ:
         - Алгоритмическая сложность
         - Утечки памяти
         - Оптимизация циклов
         - Кэширование
         - Асинхронные операции

      7. ТЕСТИРУЕМОСТЬ:
         - Модульность кода
         - Возможность мок-тестирования
         - Изоляция побочных эффектов
         - Покрытие тестами
         - Тестовые сценарии

      8. МАСШТАБИРУЕМОСТЬ:
         - Возможности расширения
         - Гибкость архитектуры
         - Повторное использование
         - Управление состоянием
         - Обработка нагрузки

      9. СОВМЕСТИМОСТЬ:
         - Кросс-браузерность
         - Версии Node.js/npm
         - Зависимости платформы
         - API совместимость
         - Обратная совместимость

      10. ДОКУМЕНТАЦИЯ:
          - Наличие комментариев
          - JSDoc/TypeDoc
          - README файлы
          - Примеры использования
          - Инструкции по развертыванию

      ${
        shouldAutofix
          ? `
      11. РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ:
          - Критические исправления
          - Рефакторинг
          - Оптимизация
          - Улучшение читаемости
          - Повышение надежности
      `
          : ""
      }

      ${fileName ? `\nАнализируемый файл: ${fileName}` : ""}
      
      Код для анализа:
      ${code}
      
      Предоставь структурированный отчет с оценкой по каждому критерию и конкретными примерами найденных проблем или рекомендаций.
    `;

    logger.info("\n⏳ Выполняю комплексный анализ кода...");
    const result = await chat.sendMessage(analysisPrompt);
    logger.info("\n📊 Результаты анализа:\n" + result.response.text() + "\n");

    if (shouldAutofix) {
      const fixPrompt = `
        На основе проведенного анализа, выполни следующие улучшения кода:
        1. Исправь все найденные ошибки
        2. Оптимизируй производительность
        3. Улучши читаемость и поддерживаемость
        4. Добавь необходимые комментарии
        5. Примени лучшие практики

        Исходный код:
        ${code}
        
        Верни улучшенную версию с комментариями по внесенным изменениям.
      `;

      logger.info("\n⏳ Генерирую улучшенную версию кода...");
      const fixResult = await chat.sendMessage(fixPrompt);
      logger.info("\n🔧 Улучшенный код:\n" + fixResult.response.text() + "\n");
    }
  } catch (error) {
    logger.error(`❌ Ошибка анализа: ${error.message}`);
    throw error;
  }
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Добавляем функцию для парсинга аргументов анализа
function parseAnalysisArgs(input) {
  const args = input.split(" ");
  const paths = [];
  const checks = new Set();

  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const check = arg.slice(2);
      if (check === "all") {
        Object.keys(analyzeCommands).forEach((cmd) => checks.add(cmd));
      } else if (analyzeCommands[check]) {
        checks.add(check);
      }
    } else {
      paths.push(arg);
    }
  });

  return {
    paths: paths.length > 0 ? paths[0].split(",") : [],
    checks: Array.from(checks),
  };
}

// Обновленная функция parseCLIArgs
function parseCLIArgs(args) {
  if (!args || args.length === 0) {
    return null;
  }

  const command = args[0];
  const options = {
    paths: [],
    checks: new Set(),
    autofix: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);
      if (flag === "autofix") {
        options.autofix = true;
      } else if (flag === "all") {
        Object.keys(analyzeCommands).forEach((cmd) => options.checks.add(cmd));
      } else if (analyzeCommands[flag]) {
        options.checks.add(flag);
      }
    } else {
      options.paths.push(arg);
    }
  }

  return {
    command,
    options: {
      ...options,
      checks: Array.from(options.checks),
    },
  };
}

// Добавляем функцию для отображения прогресса
function showProgress(current, total, label = "Прогресс") {
  const width = 30;
  const progress = Math.round((current / total) * width);
  const percentage = Math.round((current / total) * 100);

  const bar = "█".repeat(progress) + "░".repeat(width - progress);
  logger.info(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);
}

// Обновляем функцию analyzeFile с подробным выводом
async function analyzeFile(chat, filePath, checks, shouldAutofix) {
  try {
    logger.info(`\n📄 Анализ файла: ${filePath}`);
    const code = await fs.readFile(filePath, "utf8");

    logger.info("\nСтатистика файла:");
    logger.info(`- Размер: ${(code.length / 1024).toFixed(2)} KB`);
    logger.info(`- Строк кода: ${code.split("\n").length}`);

    const results = {
      issues: 0,
      warnings: 0,
      suggestions: 0,
    };

    logger.info("\nЗапланированные проверки:");
    checks.forEach((check) => {
      logger.info(`✓ ${analyzeCommands[check].desc}`);
    });

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      showProgress(i + 1, checks.length, "Выполнение проверок");

      logger.info(`\n⚡ Выполняется ${analyzeCommands[check].desc}...`);

      if (check === "perf") {
        await analyzePerformance(chat, code);
      } else if (check === "sec") {
        await analyzeSecurityIssues(chat, code);
      } else {
        const result = await chat.sendMessage(`
          Выполни ${analyzeCommands[check].desc} для файла ${path.basename(
          filePath
        )}:
          ${analyzeCommands[check].sections.map((s) => `- ${s}`).join("\n")}
          
          Код:
          ${code}

          Формат ответа:
          {
            "issues": [список критических проблем],
            "warnings": [список предупреждений],
            "suggestions": [список рекомендаций],
            "analysis": "детальный анализ"
          }
        `);

        // Парсим результат и обновляем статистику
        const analysisResult = result.response.text();
        try {
          const parsed = JSON.parse(analysisResult);
          results.issues += parsed.issues?.length || 0;
          results.warnings += parsed.warnings?.length || 0;
          results.suggestions += parsed.suggestions?.length || 0;
        } catch {
          logger.info("\nРезультаты:", analysisResult);
        }
      }
    }

    // Выводим итоговую статистику
    logger.info("\n📊 Итоги анализа:");
    logger.info(`- Критические проблемы: ${results.issues}`);
    logger.info(`- Предупреждения: ${results.warnings}`);
    logger.info(`- Рекомендации: ${results.suggestions}`);

    if (shouldAutofix) {
      logger.info("\n🔧 Генерация исправлений...");
      await generateFixes(chat, code, "all");
    }
  } catch (error) {
    logger.error(`❌ Ошибка анализа файла ${filePath}:`, error.message);
  }
}

// Обновляем функцию handleBatchAnalysis
async function handleBatchAnalysis(chat, cliArgs = null) {
  try {
    let paths = [];
    let checks = [];
    let shouldAutofix = false;

    if (cliArgs) {
      logger.info("Анализ аргументов командной строки...");
      const parseResult = parseCLIArgs(cliArgs.split(" "));
      if (!parseResult) {
        throw new Error("Некорректные аргументы командной строки");
      }
      const { options } = parseResult;
      paths = options.paths;
      checks = options.checks;
      shouldAutofix = options.autofix || false;

      // Проверка на пустые пути
      if (paths.length === 0) {
        throw new Error("Не указаны пути для анализа");
      }

      logger.info(`Найдено путей: ${paths.length}`);
      logger.info(`Выбранные проверки: ${checks.join(", ")}`);
      logger.info(
        `Автоисправление: ${shouldAutofix ? "включено" : "выключено"}`
      );
    }

    // Сканируем файлы
    logger.info("Сканирование файловой системы...", "progress");
    let allFiles = [];

    for (const pathPattern of paths) {
      logger.info(`Обработка пути: ${pathPattern}`);
      const resolvedPath = await resolvePath(pathPattern);
      logger.info(`Полный путь: ${resolvedPath}`);

      try {
        const stats = await fs.stat(resolvedPath);

        if (stats.isDirectory()) {
          logger.info(`Сканирование директории ${resolvedPath}...`);
          const files = await getAllFiles(resolvedPath);
          allFiles = allFiles.concat(files);
          logger.info(`Найдено файлов в директории: ${files.length}`);
        } else {
          allFiles.push(resolvedPath);
          logger.info(`Добавлен файл: ${resolvedPath}`);
        }
      } catch (error) {
        logger.error(`Ошибка обработки пути ${pathPattern}: ${error.message}`);
      }
    }

    if (allFiles.length === 0 && paths.length > 0) {
      throw new Error("Не найдено файлов для анализа");
    }

    logger.info(`\nВсего найдено файлов: ${allFiles.length}`, "success");

    // Анализируем файлы
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      logger.info( 
        `\nАнализ файла (${i + 1}/${allFiles.length}): ${file}`,
        "progress"
      );
      await analyzeFile(chat, file, checks, shouldAutofix);
    }

    logger.info("\nПакетный анализ завершен", "success");
  } catch (error) {
    logger.error(error.message, "error");
    if (process.env.DEBUG === 'true') {
      logger.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Добавляем вспомогательную функцию для анализа файла
async function analyzeFile(chat, filePath, checks, shouldAutofix) {
  try {
    const fileStats = await fs.stat(filePath);
    const code = await fs.readFile(filePath, "utf8");

    logger.info("\nСтатистика файла:");
    logger.info(`- Имя: ${path.basename(filePath)}`);
    logger.info(`- Размер: ${(fileStats.size / 1024).toFixed(2)} KB`);
    logger.info(`- Строк кода: ${code.split("\n").length}`);
    logger.info(`- Последнее изменение: ${fileStats.mtime}`);

    const results = {
      issues: 0,
      warnings: 0,
      suggestions: 0,
    };

    logger.info("\nЗапланированные проверки:");
    checks.forEach((check) => {
      logger.info(`✓ ${analyzeCommands[check].desc}`);
    });

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      showProgress(i + 1, checks.length, "Выполнение проверок");

      logger.info(`\n⚡ Выполняется ${анalyzeCommands[check].desc}...`);

      if (check === "perf") {
        await analyzePerformance(chat, code);
      } else if (check === "sec") {
        await analyzeSecurityIssues(chat, code);
      } else {
        const result = await chat.sendMessage(`
          Выполни ${анalyzeCommands[check].desc} для файла ${path.basename(
          filePath
        )}:
          ${analyzeCommands[check].sections.map((s) => `- ${s}`).join("\n")}
          
          Код:
          ${code}

          Формат ответа:
          {
            "issues": [список критических проблем],
            "warnings": [список предупреждений],
            "suggestions": [список рекомендаций],
            "analysis": "детальный анализ"
          }
        `);

        // Парсим результат и обновляем статистику
        const analysisResult = result.response.text();
        try {
          const parsed = JSON.parse(analysisResult);
          results.issues += parsed.issues?.length || 0;
          results.warnings += parsed.warnings?.length || 0;
          results.suggestions += parsed.suggestions?.length || 0;
        } catch {
          logger.info("\nРезультаты:", analysisResult);
        }
      }
    }

    // Выводим итоговую статистику
    logger.info("\n📊 Итоги анализа:");
    logger.info(`- Критические проблемы: ${results.issues}`);
    logger.info(`- Предупреждения: ${results.warnings}`);
    logger.info(`- Рекомендации: ${results.suggestions}`);

    if (shouldAutofix) {
      logger.info("\n🔧 Генерация исправлений...");
      await generateFixes(chat, code, "all");
    }
  } catch (error) {
    logger.error(`Ошибка анализа файла ${filePath}: ${error.message}`, "error");
  }
}

// Обновляем main для корректной обработки CLI
async function main() {
  try {
    if (processArgs.length > 0) {
      const { command, options } = parseCLIArgs(processArgs);

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const chat = model.startChat({
        generationConfig: { maxOutputTokens: 2048 },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      switch (command) {
        case "analyze-batch":
          await handleBatchAnalysis(chat, processArgs.slice(1).join(" "));
          break;
        case "analyze":
          if (options.paths.length === 1) {
            const code = await fs.readFile(options.paths[0], "utf8");
            await analyzeCode(
              chat,
              code,
              options.autofix,
              path.basename(options.paths[0])
            );
          }
          break;
        case "help":
          await showHelp();
          break;
        default:
          logger.error("❌ Неизвестная команда:", command);
          process.exit(1);
      }
      rl.close();
      return;
    }

    // Интерактивный режим
    logger.info("\n🤖 Добро пожаловать в Gemini AI Assistant!");

    while (true) {
      logger.info("\n=== Главное меню ===");
      logger.info("1. 💭 Chat режим");
      logger.info("2. 🚀 Прямой запрос");
      logger.info("3. 👋 Выход");

      const choice = await promptUser("\nВыберите режим (1-3): ");

      switch (choice) {
        case "1":
          await runChat();
          break;
        case "2":
          const prompt = await promptUser("Введите ваш запрос: ");
          await makeDirectRequest(prompt);
          break;
        case "3":
          logger.info("\n👋 До свидания!");
          rl.close();
          return;
        default:
          logger.error("❌ Неверный выбор. Попробуйте снова.");
      }
    }
  } catch (error) {
    logger.error("❌ Ошибка:", error);
  } finally {
    rl.close();
  }
}

main();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require("readline");
const fs = require("fs").promises;
const path = require("path");
const logger = require('./logger');
require("dotenv").config();

// Добавить в начало файла после импортов
const processArgs = process.argv.slice(2);

// Добавляем валидацию входных данных
function validatePath(path) {
  if (!path || typeof path !== "string") {
    throw new Error("Путь должен быть строкой");
  }
  if (path.includes("..")) {
    throw new Error('Путь не должен содержать ".."');
  }
  return path.trim();
}

function validateCode(code) {
  if (!code || typeof code !== "string") {
    throw new Error("Код должен быть строкой");
  }
  if (code.length < 1) {
    throw new Error("Код не может быть пустым");
  }
  return code.trim();
}

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Обновляем helpCommands с дополнительными примерами
const helpCommands = {
  "/help": {
    desc: "Показать список команд",
    examples: [
      "'/help' - показать все доступные команды",
      "'/help code' - информация о команде code",
      "'/help analyze' - информация об анализе кода",
    ],
  },
  "/code": {
    desc: "Режим генерации кода",
    examples: [
      "'/code' - создать новый код",
      "Примеры заданий:",
      "- Python: class User with authentication",
      "- JavaScript: async function for API calls",
      "- TypeScript: interface for User model",
      "- React: component for data table",
      "- Node.js: Express middleware for logging",
    ],
  },
  "/explain": {
    desc: "Объяснить концепцию",
    examples: [
      "'/explain' - получить объяснение",
      "Примеры тем:",
      "- JavaScript: Promise, async/await, closure",
      "- React: hooks, virtual DOM, lifecycle",
      "- Node.js: event loop, streams, buffers",
      "- TypeScript: generics, unions, decorators",
      "- Python: generators, decorators, context managers",
    ],
  },
  "/analyze": {
    desc: "Анализ кода на ошибки",
    examples: [
      "'/analyze' - начать анализ кода",
      "Поддерживает:",
      "- Ручной ввод кода",
      "- Анализ файла",
      "- Анализ папки",
    ],
  },
  "/exit": {
    desc: "Выход в главное меню",
    examples: ["'/exit' - вернуться в меню"],
  },
  "/analyze-batch": {
    desc: "Пакетный анализ файлов с указанием проверок",
    examples: [
      "'/analyze-batch' - запустить пакетный анализ",
      "Примеры использования:",
      "- ./src/**/*.js --basic --perf",
      "- ./src/main.js,./tests/*.js --all",
      "- ./project --deep --sec",
      "Доступные флаги:",
      "--all: все проверки",
      "--basic: базовый анализ",
      "--deep: глубокий анализ",
      "--perf: производительность",
      "--sec: безопасность",
      "--doc: документация",
    ],
  },
};

async function showHelp() {
  logger.info("\n=== 📚 Справка по командам ===");
  Object.entries(helpCommands).forEach(([cmd, info]) => {
    logger.info(`\n${cmd}: ${info.desc}`);
    logger.info("Примеры использования:");
    info.examples.forEach((ex) => logger.info(`  ${ex}`));
  });
  logger.info(
    "\nПримечание: Команды работают как с префиксом в начале (/help), так и в конце (help/)"
  );
}

async function handleCodeGeneration(chat) {
  logger.info("\n=== Режим генерации кода ===");
  logger.info("Укажите язык и опишите что нужно создать");

  const prompt = await promptUser("🖥️ Задание: ");
  const result = await chat.sendMessage(`Generate code: ${prompt}`);
  logger.info("\n```\n" + result.response.text() + "\n```\n");
}

async function getAllFiles(dirPath) {
  const files = [];

  async function scan(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await scan(dirPath);
  return files;
}

// Добавляем функцию для получения текущего пути
async function getCurrentDirectory() {
  return process.cwd();
}

// Обновляем функцию для обработки путей
async function resolvePath(inputPath) {
  if (!inputPath) {
    return process.cwd();
  }

  // Если путь относительный, делаем его абсолютным
  if (!path.isAbsolute(inputPath)) {
    return path.resolve(process.cwd(), inputPath);
  }
  return inputPath;
}

const analyzeCommands = {
  basic: {
    desc: "Базовый анализ кода",
    sections: ["Синтаксис", "Импорты", "Структура", "Стиль", "Безопасность"],
  },
  deep: {
    desc: "Глубокий анализ кода",
    sections: [
      "Синтаксис",
      "Импорты",
      "Структура",
      "Стиль",
      "Безопасность",
      "Производительность",
      "Масштабируемость",
      "Тестируемость",
    ],
  },
  perf: {
    desc: "Анализ производительности",
    sections: ["Алгоритмы", "Память", "Циклы", "Кэширование", "Асинхронность"],
  },
  sec: {
    desc: "Анализ безопасности",
    sections: ["Уязвимости", "Валидация", "Защита данных", "Конфигурация"],
  },
  doc: {
    desc: "Проверка документации",
    sections: ["Комментарии", "JSDoc", "README", "Примеры", "Инструкции"],
  },
};

async function handleCodeAnalysis(chat) {
  try {
    logger.info("\n=== Режим анализа кода ===");
    logger.info("Выберите тип анализа:");
    Object.entries(analyzeCommands).forEach(([cmd, info], index) => {
      logger.info(`${index + 1}. ${cmd}: ${info.desc}`);
    });

    const analysisType = await promptUser("\nВыберите тип анализа (1-5): ");
    const selectedCommand =
      Object.keys(analyzeCommands)[parseInt(analysisType) - 1];

    if (!selectedCommand) {
      throw new Error("Неверный выбор типа анализа");
    }

    logger.info(`\nВыбран анализ: ${analyzeCommands[selectedCommand].desc}`);
    logger.info("Выберите источник кода:");
    logger.info("1. Ввести код вручную");
    logger.info("2. Указать путь к файлу");
    logger.info("3. Указать путь к папке (рекурсивно)");
    logger.info("4. Выбрать несколько файлов");

    const currentDir = await getCurrentDirectory();
    logger.info(`\nТекущая папка: ${currentDir}`);
    logger.info("Подсказка: Можно использовать:");
    logger.info("- Абсолютный путь (/home/user/project)");
    logger.info("- Относительный путь (./src или ../project)");
    logger.info("- Только имя папки для текущей директории\n");

    const choice = await promptUser("Выберите опцию (1-4): ");
    if (!["1", "2", "3", "4"].includes(choice)) {
      throw new Error("Неверный выбор опции");
    }

    let files = [];
    let code = "";

    switch (choice) {
      case "1":
        code = validateCode(await promptUser("📝 Введите код: "));
        break;
      case "2":
        const filePath = validatePath(await promptUser("📂 Путь к файлу: "));
        const resolvedFilePath = await resolvePath(filePath);
        await validateFileAccess(resolvedFilePath);
        files = [resolvedFilePath];
        break;
      case "3":
        const dirPath = await promptUser("📁 Укажите путь к папке: ");
        const resolvedDirPath = await resolvePath(dirPath);
        logger.info(`\nПолный путь: ${resolvedDirPath}`);

        try {
          // Проверяем существование директории
          await fs.access(resolvedDirPath);
          files = await getAllFiles(resolvedDirPath);

          if (files.length === 0) {
            logger.info("⚠️ В указанной папке нет файлов");
            return;
          }

          logger.info("\nНайденные файлы:");
          files.forEach((file, index) => {
            // Показываем относительный путь для удобства
            const relativePath = path.relative(resolvedDirPath, file);
            logger.info(`${index + 1}. ${relativePath}`);
          });

          const shouldAnalyzeAll =
            (
              await promptUser("Анализировать все файлы? (y/n): ")
            ).toLowerCase() === "y";

          if (!shouldAnalyzeAll) {
            const selectedIndexes = (
              await promptUser("Введите номера файлов через запятую: ")
            ).split(",");
            files = selectedIndexes.map((i) => files[parseInt(i.trim()) - 1]);
          }
        } catch (error) {
          if (error.code === "ENOENT") {
            logger.error(`❌ Папка не найдена: ${resolvedDirPath}`);
          } else {
            logger.error(`❌ Ошибка сканирования: ${error.message}`);
          }
          return;
        }
        break;
      case "4":
        const filePaths = (
          await promptUser("📂 Укажите пути к файлам через запятую: ")
        ).split(",");
        files = filePaths.map((p) => p.trim());
        break;
      default:
        logger.error("❌ Неверный выбор");
        return;
    }

    const shouldAutofix =
      (
        await promptUser("🔧 Включить автоисправление? (y/n): ")
      ).toLowerCase() === "y";

    const analysisPrompt = `
      Выполни ${
        analyzeCommands[selectedCommand].desc
      } и предоставь детальный отчет.
      Проверь следующие аспекты:
      ${analyzeCommands[selectedCommand].sections
        .map((s) => `- ${s}`)
        .join("\n")}
      
      ${fileName ? `\nФайл: ${fileName}` : ""}
      
      Код:
      ${code}
      
      Предоставь структурированный отчет с оценкой по каждому критерию.
    `;

    logger.info(
      `\n⏳ Выполняю ${analyzeCommands[selectedCommand].desc.toLowerCase()}...`
    );
    const result = await chat.sendMessage(analysisPrompt);
    logger.info("\n📊 Результаты анализа:\n" + result.response.text() + "\n");

    // Добавляем специфичные проверки для каждого типа анализа
    if (selectedCommand === "perf") {
      await analyzePerformance(chat, code);
    } else if (selectedCommand === "sec") {
      await analyzeSecurityIssues(chat, code);
    }

    if (shouldAutofix) {
      await generateFixes(chat, code, selectedCommand);
    }
  } catch (error) {
    logger.error(`❌ Ошибка: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      logger.error("Stack trace:", error.stack);
    }
  }
}

async function analyzePerformance(chat, code) {
  const perfPrompt = `
    Проведи детальный анализ производительности кода:
    1. Оценка временной сложности (Big O)
    2. Поиск узких мест
    3. Проверка оптимизации циклов
    4. Анализ использования памяти
    5. Рекомендации по оптимизации
    
    Код: ${code}
  `;

  const result = await chat.sendMessage(perfPrompt);
  logger.info("\n⚡ Анализ производительности:\n" + result.response.text());
}

async function analyzeSecurityIssues(chat, code) {
  const securityPrompt = `
    Проведи анализ безопасности кода:
    1. Поиск уязвимостей
    2. Проверка валидации входных данных
    3. Анализ обработки ошибок
    4. Проверка защиты данных
    5. Рекомендации по улучшению
    
    Код: ${code}
  `;

  const result = await chat.sendMessage(securityPrompt);
  logger.info("\n🔒 Анализ безопасности:\n" + result.response.text());
}

// Добавляем проверку доступа к файлу
async function validateFileAccess(filepath) {
  try {
    await fs.access(filepath, fs.constants.R_OK);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Файл не найден: ${filepath}`);
    }
    if (error.code === "EACCES") {
      throw new Error(`Нет доступа к файлу: ${filepath}`);
    }
    throw error;
  }
}

async function analyzeCode(chat, code, shouldAutofix, fileName = "") {
  try {
    code = validateCode(code);

    const analysisPrompt = `
      Выполни комплексный анализ кода и предоставь детальный отчет по всем критериям:

      1. СИНТАКСИС И БАЗОВЫЕ ПРОВЕРКИ:
         - Синтаксические ошибки
         - Типографические ошибки
         - Форматирование кода
         - Отступы и пробелы
         - Парные символы (скобки, кавычки)

      2. ИМПОРТЫ И ЗАВИСИМОСТИ:
         - Проверка корректности импортов
         - Неиспользуемые импорты
         - Отсутствующие зависимости
         - Конфликты версий
         - Циклические зависимости

      3. АРХИТЕКТУРА И СТРУКТУРА:
         - Организация кода
         - Разделение ответственности
         - Повторяющийся код (DRY)
         - Сложность функций
         - Глубина вложенности

      4. СТИЛЬ КОДИРОВАНИЯ:
         - Соответствие стандартам
         - Наименование переменных/функций
         - Комментарии и документация
         - Длина строк/функций
         - Единообразие стиля

      5. БЕЗОПАСНОСТЬ:
         - Уязвимости
         - Обработка ошибок
         - Валидация входных данных
         - Защита данных
         - Безопасная конфигурация

      6. ПРОИЗВОДИТЕЛЬНОСТЬ:
         - Алгоритмическая сложность
         - Утечки памяти
         - Оптимизация циклов
         - Кэширование
         - Асинхронные операции

      7. ТЕСТИРУЕМОСТЬ:
         - Модульность кода
         - Возможность мок-тестирования
         - Изоляция побочных эффектов
         - Покрытие тестами
         - Тестовые сценарии

      8. МАСШТАБИРУЕМОСТЬ:
         - Возможности расширения
         - Гибкость архитектуры
         - Повторное использование
         - Управление состоянием
         - Обработка нагрузки

      9. СОВМЕСТИМОСТЬ:
         - Кросс-браузерность
         - Версии Node.js/npm
         - Зависимости платформы
         - API совместимость
         - Обратная совместимость

      10. ДОКУМЕНТАЦИЯ:
          - Наличие комментариев
          - JSDoc/TypeDoc
          - README файлы
          - Примеры использования
          - Инструкции по развертыванию

      ${
        shouldAutofix
          ? `
      11. РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ:
          - Критические исправления
          - Рефакторинг
          - Оптимизация
          - Улучшение читаемости
          - Повышение надежности
      `
          : ""
      }

      ${fileName ? `\nАнализируемый файл: ${fileName}` : ""}
      
      Код для анализа:
      ${code}
      
      Предоставь структурированный отчет с оценкой по каждому критерию и конкретными примерами найденных проблем или рекомендаций.
    `;

    logger.info("\n⏳ Выполняю комплексный анализ кода...");
    const result = await chat.sendMessage(analysisPrompt);
    logger.info("\n📊 Результаты анализа:\n" + result.response.text() + "\n");

    if (shouldAutofix) {
      const fixPrompt = `
        На основе проведенного анализа, выполни следующие улучшения кода:
        1. Исправь все найденные ошибки
        2. Оптимизируй производительность
        3. Улучши читаемость и поддерживаемость
        4. Добавь необходимые комментарии
        5. Примени лучшие практики

        Исходный код:
        ${code}
        
        Верни улучшенную версию с комментариями по внесенным изменениям.
      `;

      logger.info("\n⏳ Генерирую улучшенную версию кода...");
      const fixResult = await chat.sendMessage(fixPrompt);
      logger.info("\n🔧 Улучшенный код:\n" + fixResult.response.text() + "\n");
    }
  } catch (error) {
    logger.error(`❌ Ошибка анализа: ${error.message}`);
    throw error;
  }
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Добавляем функцию для парсинга аргументов анализа
function parseAnalysisArgs(input) {
  const args = input.split(" ");
  const paths = [];
  const checks = new Set();

  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const check = arg.slice(2);
      if (check === "all") {
        Object.keys(analyzeCommands).forEach((cmd) => checks.add(cmd));
      } else if (analyzeCommands[check]) {
        checks.add(check);
      }
    } else {
      paths.push(arg);
    }
  });

  return {
    paths: paths.length > 0 ? paths[0].split(",") : [],
    checks: Array.from(checks),
  };
}

// Обновленная функция parseCLIArgs
function parseCLIArgs(args) {
  if (!args || args.length === 0) {
    return null;
  }

  const command = args[0];
  const options = {
    paths: [],
    checks: new Set(),
    autofix: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);
      if (flag === "autofix") {
        options.autofix = true;
      } else if (flag === "all") {
        Object.keys(analyzeCommands).forEach((cmd) => options.checks.add(cmd));
      } else if (analyzeCommands[flag]) {
        options.checks.add(flag);
      }
    } else {
      options.paths.push(arg);
    }
  }

  return {
    command,
    options: {
      ...options,
      checks: Array.from(options.checks),
    },
  };
}

// Добавляем функцию для отображения прогресса
function showProgress(current, total, label = "Прогресс") {
  const width = 30;
  const progress = Math.round((current / total) * width);
  const percentage = Math.round((current / total) * 100);

  const bar = "█".repeat(progress) + "░".repeat(width - progress);
  logger.info(`\r${label}: [${bar}] ${percentage}% (${current}/${total})`);
}

// Обновляем функцию analyzeFile с подробным выводом
async function analyzeFile(chat, filePath, checks, shouldAutofix) {
  try {
    logger.info(`\n📄 Анализ файла: ${filePath}`);
    const code = await fs.readFile(filePath, "utf8");

    logger.info("\nСтатистика файла:");
    logger.info(`- Размер: ${(code.length / 1024).toFixed(2)} KB`);
    logger.info(`- Строк кода: ${code.split("\n").length}`);

    const results = {
      issues: 0,
      warnings: 0,
      suggestions: 0,
    };

    logger.info("\nЗапланированные проверки:");
    checks.forEach((check) => {
      logger.info(`✓ ${analyzeCommands[check].desc}`);
    });

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      showProgress(i + 1, checks.length, "Выполнение проверок");

      logger.info(`\n⚡ Выполняется ${analyzeCommands[check].desc}...`);

      if (check === "perf") {
        await analyzePerformance(chat, code);
      } else if (check === "sec") {
        await analyzeSecurityIssues(chat, code);
      } else {
        const result = await chat.sendMessage(`
          Выполни ${analyzeCommands[check].desc} для файла ${path.basename(
          filePath
        )}:
          ${analyzeCommands[check].sections.map((s) => `- ${s}`).join("\n")}
          
          Код:
          ${code}

          Формат ответа:
          {
            "issues": [список критических проблем],
            "warnings": [список предупреждений],
            "suggestions": [список рекомендаций],
            "analysis": "детальный анализ"
          }
        `);

        // Парсим результат и обновляем статистику
        const analysisResult = result.response.text();
        try {
          const parsed = JSON.parse(analysisResult);
          results.issues += parsed.issues?.length || 0;
          results.warnings += parsed.warnings?.length || 0;
          results.suggestions += parsed.suggestions?.length || 0;
        } catch {
          logger.info("\nРезультаты:", analysisResult);
        }
      }
    }

    // Выводим итоговую статистику
    logger.info("\n📊 Итоги анализа:");
    logger.info(`- Критические проблемы: ${results.issues}`);
    logger.info(`- Предупреждения: ${results.warnings}`);
    logger.info(`- Рекомендации: ${results.suggestions}`);

    if (shouldAutofix) {
      logger.info("\n🔧 Генерация исправлений...");
      await generateFixes(chat, code, "all");
    }
  } catch (error) {
    logger.error(`❌ Ошибка анализа файла ${filePath}:`, error.message);
  }
}

// Обновляем функцию handleBatchAnalysis
async function handleBatchAnalysis(chat, cliArgs = null) {
  try {
    let paths = [];
    let checks = [];
    let shouldAutofix = false;

    if (cliArgs) {
      logger.info("Анализ аргументов командной строки...");
      const parseResult = parseCLIArgs(cliArgs.split(" "));
      if (!parseResult) {
        throw new Error("Некорректные аргументы командной строки");
      }
      const { options } = parseResult;
      paths = options.paths;
      checks = options.checks;
      shouldAutofix = options.autofix || false;

      // Проверка на пустые пути
      if (paths.length === 0) {
        throw new Error("Не указаны пути для анализа");
      }

      logger.info(`Найдено путей: ${paths.length}`);
      logger.info(`Выбранные проверки: ${checks.join(", ")}`);
      logger.info(
        `Автоисправление: ${shouldAutofix ? "включено" : "выключено"}`
      );
    }

    // Сканируем файлы
    logger.info("Сканирование файловой системы...", "progress");
    let allFiles = [];

    for (const pathPattern of paths) {
      logger.info(`Обработка пути: ${pathPattern}`);
      const resolvedPath = await resolvePath(pathPattern);
      logger.info(`Полный путь: ${resolvedPath}`);

      try {
        const stats = await fs.stat(resolvedPath);

        if (stats.isDirectory()) {
          logger.info(`Сканирование директории ${resolvedPath}...`);
          const files = await getAllFiles(resolvedPath);
          allFiles = allFiles.concat(files);
          logger.info(`Найдено файлов в директории: ${files.length}`);
        } else {
          allFiles.push(resolvedPath);
          logger.info(`Добавлен файл: ${resolvedPath}`);
        }
      } catch (error) {
        logger.error(`Ошибка обработки пути ${pathPattern}: ${error.message}`);
      }
    }

    if (allFiles.length === 0 && paths.length > 0) {
      throw new Error("Не найдено файлов для анализа");
    }

    logger.info(`\nВсего найдено файлов: ${allFiles.length}`, "success");

    // Анализируем файлы
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      logger.info( 
        `\nАнализ файла (${i + 1}/${allFiles.length}): ${file}`,
        "progress"
      );
      await analyzeFile(chat, file, checks, shouldAutofix);
    }

    logger.info("\nПакетный анализ завершен", "success");
  } catch (error) {
    logger.error(error.message, "error");
    if (process.env.DEBUG === 'true') {
      logger.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Добавляем вспомогательную функцию для анализа файла
async function analyzeFile(chat, filePath, checks, shouldAutofix) {
  try {
    const fileStats = await fs.stat(filePath);
    const code = await fs.readFile(filePath, "utf8");

    logger.info("\nСтатистика файла:");
    logger.info(`- Имя: ${path.basename(filePath)}`);
    logger.info(`- Размер: ${(fileStats.size / 1024).toFixed(2)} KB`);
    logger.info(`- Строк кода: ${code.split("\n").length}`);
    logger.info(`- Последнее изменение: ${fileStats.mtime}`);

    const results = {
      issues: 0,
      warnings: 0,
      suggestions: 0,
    };

    logger.info("\nЗапланированные проверки:");
    checks.forEach((check) => {
      logger.info(`✓ ${analyzeCommands[check].desc}`);
    });

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      showProgress(i + 1, checks.length, "Выполнение проверок");

      logger.info(`\n⚡ Выполняется ${analyzeCommands[check].desc}...`);

      if (check === "perf") {
        await analyzePerformance(chat, code);
      } else if (check === "sec") {
        await analyzeSecurityIssues(chat, code);
      } else {
        const result = await chat.sendMessage(`
          Выполни ${analyzeCommands[check].desc} для файла ${path.basename(
          filePath
        )}:
          ${analyzeCommands[check].sections.map((s) => `- ${s}`).join("\n")}
          
          Код:
          ${code}

          Формат ответа:
          {
            "issues": [список критических проблем],
            "warnings": [список предупреждений],
            "suggestions": [список рекомендаций],
            "analysis": "детальный анализ"
          }
        `);

        // Парсим результат и обновляем статистику
        const analysisResult = result.response.text();
        try {
          const parsed = JSON.parse(analysisResult);
          results.issues += parsed.issues?.length || 0;
          results.warnings += parsed.warnings?.length || 0;
          results.suggestions += parsed.suggestions?.length || 0;
        } catch {
          logger.info("\nРезультаты:", analysisResult);
        }
      }
    }

    // Выводим итоговую статистику
    logger.info("\n📊 Итоги анализа:");
    logger.info(`- Критические проблемы: ${results.issues}`);
    logger.info(`- Предупреждения: ${results.warnings}`);
    logger.info(`- Рекомендации: ${results.suggestions}`);

    if (shouldAutofix) {
      logger.info("\n🔧 Генерация исправлений...");
      await generateFixes(chat, code, "all");
    }
  } catch (error) {
    logger.error(`Ошибка анализа файла ${filePath}: ${error.message}`, "error");
  }
}

// Обновляем main для корректной обработки CLI
async function main() {
  try {
    if (processArgs.length > 0) {
      const { command, options } = parseCLIArgs(processArgs);

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const chat = model.startChat({
        generationConfig: { maxOutputTokens: 2048 },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      switch (command) {
        case "analyze-batch":
          await handleBatchAnalysis(chat, processArgs.slice(1).join(" "));
          break;
        case "analyze":
          if (options.paths.length === 1) {
            const code = await fs.readFile(options.paths[0], "utf8");
            await analyzeCode(
              chat,
              code,
              options.autofix,
              path.basename(options.paths[0])
            );
          }
          break;
        case "help":
          await showHelp();
          break;
        default:
          logger.error("❌ Неизвестная команда:", command);
          process.exit(1);
      }
      rl.close();
      return;
    }

    // Интерактивный режим
    logger.info("\n🤖 Добро пожаловать в Gemini AI Assistant!");

    while (true) {
      logger.info("\n=== Главное меню ===");
      logger.info("1. 💭 Chat режим");
      logger.info("2. 🚀 Прямой запрос");
      logger.info("3. 👋 Выход");

      const choice = await promptUser("\nВыберите режим (1-3): ");

      switch (choice) {
        case "1":
          await runChat();
          break;
        case "2":
          const prompt = await promptUser("Введите ваш запрос: ");
          await makeDirectRequest(prompt);
          break;
        case "3":
          logger.info("\n👋 До свидания!");
          rl.close();
          return;
        default:
          logger.error("❌ Неверный выбор. Попробуйте снова.");
      }
    }
  } catch (error) {
    logger.error("❌ Ошибка:", error);
  } finally {
    rl.close();
  }
}

main();
  info: (message) => console.log(`ℹ️ ${message}`),
  error: (message) => console.error(`❌ ${error.message}`),
  warn: (message) => console.warn(`⚠️ ${message}`),
  debug: (message) => console.debug(`🔍 ${message}`),
  success: (message) => console.log(`✅ ${message}`),
};

module.exports = logger;
©