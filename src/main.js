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

const MODEL_NAME = config.modelName;
const API_KEY = config.apiKey;
logger.log(`GEMINI_API_KEY: ${API_KEY}`);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const args = process.argv.slice(2);

function showHelp() {
  console.log("Доступные команды:");
  console.log("/help - показать список команд");
  console.log("/code - режим генерации кода");
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
        console.log(result.response.text());
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
      console.log("📝 Получены типы анализа:", typesStr);
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
      console.log(
        `🔧 Установлен порог исправлений: ${options.fix} (autoApply включен)`,
      );
    }
  }

  return options;
}

async function validateApiKey() {
  try {
    console.log("🔄 Начало проверки API ключа...");

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
    console.log("\n📌 Рекомендации по исправлению:");
    console.log('1. Проверьте формат API ключа (должен начинаться с "AIza")');
    console.log("2. Активируйте API в Google Cloud Console");
    console.log("3. Убедитесь, что у ключа есть доступ к Gemini API");
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
    const files = options.recursive
      ? await getAllFilesRecursive(targetPath)
      : [targetPath];

    console.log(`\n📁 Найдено файлов: ${files.length}`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n📄 Анализ файла (${i + 1}/${files.length}): ${file}`);

      const code = await fs.readFile(file, "utf8");
      const analyzer = new CodeAnalyzer(chat, { ...options, filePath: file }); // Передаем опции в конструктор
      const results = await analyzer.analyze(code, options);

      console.log("\n📊 Детальный отчёт по файлу:");
      console.log(JSON.stringify(results, null, 2));
      console.log("🔎 Завершён анализ файла:", file);
    }

    console.log("\n✅ Анализ завершен");
  } catch (error) {
    logger.error(`❌ Ошибка анализа: ${error.message}`);
    if (error.message.includes("API")) {
      console.log("\n📌 Рекомендации по исправлению:");
      console.log("1. Проверьте подключение к интернету");
      console.log("2. Убедитесь в наличии прав доступа у ключа");
      console.log("3. Проверьте правильность endpoint URL");
    }
    process.exit(1);
  }
}

async function main() {
  if (args.length > 0) {
    const [command, ...commandArgs] = args;

    try {
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

      switch (command) {
        case "analyze":
          await handleCodeAnalysis(chat, commandArgs);
          break;
        case "chat":
          await runChat();
          break;
        case "direct":
          await makeDirectRequest(args.slice(1).join(" "));
          break;
        case "code":
          handleCodeGeneration();
          break;
        default:
          console.log(
            "Неизвестная команда. Доступные команды: chat, direct, code, analyze",
          );
      }
    } catch (error) {
      logger.error(`Ошибка инициализации чата: ${error}`);
    }
    rl.close();
  } else {
    console.log("Добро пожаловать в Gemini AI Assistant!");
    while (true) {
      console.log("Главное меню:");
      console.log("1. Chat режим");
      console.log("2. Прямой запрос");
      console.log("3. Выход");

      const choice = await promptUser("Выберите режим (1-3): ");
      switch (choice) {
        case "1":
          await runChat();
          break;
        case "2":
          const prompt = await promptUser("Введите ваш запрос: ");
          await makeDirectRequest(prompt);
          break;
        case "3":
          console.log("До свидания!");
          rl.close();
          return;
        default:
          console.log("Неверный выбор. Попробуйте снова.");
      }
    }
  }
}

main().catch(console.error);
