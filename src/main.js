const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require("readline");
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();
const CodeAnalyzer = require("./analyzer");
const { ANALYSIS_TYPES } = require("./constants");

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;
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
  const genAI = new GoogleGenerativeAI({ credentials: { api_key: API_KEY } });
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const chat = model.startChat({
    generationConfig: { maxOutputTokens: 2048 },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
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
}

async function makeDirectRequest(prompt) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );
    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Нет данных в ответе"
    );
  } catch (error) {
    console.error("Ошибка запроса:", error.message);
    return null;
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
      console.error(`Ошибка при сканировании ${currentPath}:`, error.message);
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
    types: ["--basic"],
    fix: 70,
    recursive: false,
    autoApply: false,
    format: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--types=")) {
      options.types = arg.replace("--types=", "").split(",");
    } else if (arg === "--recursive") {
      options.recursive = true;
    } else if (arg === "--auto-apply") {
      options.autoApply = true;
    } else if (arg === "--format") {
      options.format = true;
    } else if (arg.startsWith("--fix=")) {
      options.fix = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--file=")) {
      options.filePath = arg.replace("--file=", "");
    }
  }

  return options;
}

async function handleCodeAnalysis(chat, args) {
  try {
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

      console.log("\n📊 Результаты анализа:");
      console.log(JSON.stringify(results, null, 2));
    }

    console.log("\n✅ Анализ завершен");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

async function main() {
  if (args.length > 0) {
    const [command, ...commandArgs] = args;

    const genAI = new GoogleGenerativeAI({ credentials: { api_key: API_KEY } });
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
