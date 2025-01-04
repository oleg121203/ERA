const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require("readline");
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");
const CodeAnalyzer = require("./analyzer");
const { ANALYSIS_TYPES } = require("./constants");
const { testGeminiAPI } = require("../tests/test-api");
const config = require("./config/gemini.config");
const logger = require('./utils/logger');
const axios = require('axios');
const { ESLint } = require('eslint');

const MODEL_NAME = config.modelName;
const API_KEY = config.apiKey;
logger.log(`GEMINI_API_KEY: ${API_KEY}`);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const args = process.argv.slice(2);
let extraLogFile = null; // Дополнительный файл логов

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith("--log-file=")) {
    extraLogFile = arg.replace("--log-file=", "");
    logger.log(`Дополнительный лог-файл: ${extraLogFile}`);
  }
}

// Устанавливаем дополнительный файл логирования
if (extraLogFile) {
  logger.setAdditionalLogFile(extraLogFile);
}

function showHelp() {
  logger.log("Доступные команды:");
  logger.log("/help - показать список команд");
  logger.log("/code - режим генерации кода");
}

function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runChat() {
  try {
    const genAI = new GoogleGenerativeAI({ apiKey: API_KEY });
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const chat = await model.startChat({
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    while (true) {
      const prompt = await promptUser("Ваш запрос: ");
      if (prompt === "/help") {
        showHelp();
      } else if (prompt === "/code") {
        await handleCodeGeneration(chat);
      } else {
        const result = await chat.sendMessage(prompt);
        logger.log(result.response.text());
      }
    }
  } catch (error) {
    logger.error(`Ошибка инициализации чата: ${error}`);
  }
}

async function makeDirectRequest(prompt) {
  try {
    const response = await fetch(config.getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Нет данных в ответе"
    );
  } catch (error) {
    logger.error(`Ошибка запроса: ${error}`);
    throw error;
  }
}

async function getAllFilesRecursive(dir) {
  const files = [];
  const scan = async (currentPath) => {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.name.endsWith(".js")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      logger.error(`Ошибка при сканировании ${currentPath}: ${error.message}`);
    }
  };

  try {
    await fs.access(dir);
    await scan(dir);
    return files;
  } catch (error) {
    throw new Error(`Директория ${dir} не найдена или недоступна`);
  }
}

function parseAnalysisOptions(args) {
  const options = {
    types: [],
    fix: 70,
    recursive: false,
    autoApply: false,
    format: false,
    backup: true, // Добавляем опцию бэкапа по умолчанию
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--types=")) {
      const typesStr = arg.replace("--types=", "");
      logger.log("📝 Получены типы анализа:", typesStr);
      options.types = typesStr;
    } else if (arg === "--recursive") {
      options.recursive = true;
    } else if (arg === "--auto-apply") {
      options.autoApply = true;
    } else if (arg === "--format") {
      options.format = true;
    } else if (arg.startsWith("--fix=")) {
      options.fix = parseInt(arg.split("=")[1], 10);
      // Автоматически включаем автоисправление при указании --fix
      options.autoApply = true;
      logger.log(
        `🔧 Установлен порог исправлений: ${options.fix} (autoApply включен)`,
      );
    }
    // Добавляем обработку новых типов
    else if (arg === "--breakpoint") {
      options.types.push("--breakpoint");
      logger.log("🛑 Добавлен тип анализа: --breakpoint");
    }
    else if (arg === "--imports") {
      options.types.push("--imports");
      logger.log("📦 Добавлен тип анализа: --imports");
    }
  }

  return options;
}

async function validateApiKey() {
  try {
    logger.log("🔄 Начало проверки API ключа...");

    // Проверяем наличие и формат ключа
    if (!API_KEY || !/^AIza[0-9A-Za-z-_]{35}$/.test(API_KEY)) {
      throw new Error("Неверный формат API ключа");
    }

    if (!(await config.validate())) {
      throw new Error("Недействительный API ключ");
    }
    return true;
  } catch (error) {
    logger.error(`❌ Ошибка валидации API: ${error.message}`);
    logger.log("\n📌 Рекомендации по исправлению:");
    logger.log('1. Проверьте формат API ключа (должен начинаться с "AIza")');
    logger.log("2. Активируйте API в Google Cloud Console");
    logger.log("3. Убедитесь, что у ключа есть доступ к Gemini API");
    return false;
  }
}

async function handleCodeAnalysis(chat, args) {
  try {
    // Валидация API ключа перед анализом
    if (!(await validateApiKey())) {
      process.exit(1);
    }

    const options = parseAnalysisOptions(args);
    const targetPath = options.filePath || args[0] || ".";

    // Логирование указания файла для анализа
    logger.log(`📂 Указан путь для анализа: ${targetPath}`);

    const files = options.recursive
      ? await getAllFilesRecursive(targetPath)
      : [targetPath];

    logger.log(`📁 Найдено файлов: ${files.length}`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      logger.log(`📄 Анализ файла (${i + 1}/${files.length}): ${file}`);

      const code = await fs.readFile(file, "utf8");
      const analyzer = new CodeAnalyzer(chat, { ...options, filePath: file }); // Передаем опции в конструктор
      const results = await analyzer.analyze(code, options);

      logger.log("\n📊 Детальный отчёт по файлу:");
      logger.log(JSON.stringify(results, null, 2));
      logger.log("🔎 Завершён анализ файла:", file);
    }

    logger.log("\n✅ Анализ завершен");
  } catch (error) {
    logger.error(`❌ Ошибка анализа: ${error.message}`);
    if (error.message.includes("API")) {
      logger.log("\n📌 Рекомендации по исправлению:");
      logger.log("1. Проверьте подключение к интернету");
      logger.log("2. Убедитесь в наличии прав доступа у ключа");
      logger.log("3. Проверьте правильность endpoint URL");
    }
    process.exit(1);
  }
}

const eslintConfigPath = path.join(__dirname, '../config/.eslintrc.js');
const prettierConfigPath = path.join(__dirname, '../config/.prettierrc.js');

// Пример использования путей конфигурации
const eslint = new ESLint({ overrideConfigFile: eslintConfigPath });
const prettierOptions = require(prettierConfigPath);

app.use(express.json());

// Пример эндпоинта для запуска анализа кода
app.post('/api/analyze', async (req, res) => {
  try {
    const { path, options } = req.body;
    const genAI = new GoogleGenerativeAI({ apiKey: API_KEY });
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const chat = await model.startChat({
      generationConfig: { maxOutputTokens: 2048 },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    const results = await handleCodeAnalysis(chat, [path, ...Object.entries(options).map(([k,v]) => `--${k}=${v}`)]);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await makeDirectRequest(message);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Добавляем новый эндпоинт для получения файловой структуры
app.get('/api/files', async (req, res) => {
    const dirPath = req.query.path || './';
    try {
        const getFiles = async (dir) => {
            const dirents = await fs.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map(async (dirent) => {
                const resPath = path.resolve(dir, dirent.name);
                if (dirent.isDirectory()) {
                    return {
                        name: dirent.name,
                        type: 'directory',
                        path: resPath,
                        children: await getFiles(resPath)
                    };
                } else {
                    return {
                        name: dirent.name,
                        type: 'file',
                        path: resPath
                    };
                }
            }));
            return files;
        };

        const files = await getFiles(dirPath);
        res.json(files);
    } catch (error) {
        logger.error(`Ошибка при получении файловой структуры: ${error.message}`);
        res.status(500).json({ error: 'Не удалось получить файловую структуру' });
    }
});

// Подключаем папку со статическим фронтендом
app.use(express.static('public')); 

// Обновляем обработчик корневого маршрута
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});