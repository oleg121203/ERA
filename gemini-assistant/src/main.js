const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require('readline');
require('dotenv').config();

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = process.argv.slice(2);

const helpCommands = {
  '/help': 'Показать список команд',
  '/code': 'Режим генерации кода',
  '/explain': 'Объяснить концепцию',
  '/exit': 'Выход в главное меню'
};

// Добавляем блок констант для анализа
const ANALYSIS_TYPES = {
  '--basic': 'Базовый анализ',
  '--deep': 'Глубокий анализ',
  '--security': 'Анализ безопасности',
  '--imports': 'Анализ импортов',
  '--structure': 'Анализ структуры',
  '--deps': 'Анализ зависимостей',
  '--complexity': 'Анализ сложности',
  '--tests': 'Анализ тестов',
  '--docs': 'Анализ документации',
  '--scale': 'Анализ масштабируемости',
  '--api': 'Анализ API',
  '--smells': 'Code smells',
  '--debt': 'Технический долг',
  '--memory': 'Утечки памяти',
  '--perf': 'Производительность',
  '--all': 'Полный анализ'
};

async function showHelp() {
  console.log("\n=== Доступные команды ===");
  Object.entries(helpCommands).forEach(([cmd, desc]) => {
    console.log(`${cmd}: ${desc}`);
  });
}

async function handleCodeGeneration(chat) {
  console.log("\n=== Режим генерации кода ===");
  console.log("Укажите язык и опишите что нужно создать");
  
  const prompt = await promptUser("🖥️ Задание: ");
  const result = await chat.sendMessage(`Generate code: ${prompt}`);
  console.log("\n```\n" + result.response.text() + "\n```\n");
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runChat() {
  try {
    console.log("\n=== Режим чата с Gemini AI ===");
    console.log("Подсказки:");
    console.log("- Используйте /help для списка команд");
    console.log("- /code для генерации кода");
    console.log("- /exit для выхода в меню\n");

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

    while (true) {
      const prompt = await promptUser("\n🤖 Ваш запрос: ");
      
      switch(prompt.toLowerCase()) {
        case '/help':
          await showHelp();
          break;
        case '/code':
          await handleCodeGeneration(chat);
          break;
        case '/exit':
          return;
        default:
          console.log("\n⏳ Генерирую ответ...");
          const result = await chat.sendMessage(prompt);
          console.log("\n📝 Ответ:\n" + result.response.text() + "\n");
      }
    }
  } catch (error) {
    console.error("❌ Ошибка:", error);
  }
}

async function makeDirectRequest(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );
    const data = await response.json();
    
    // Форматируем и выводим ответ
    if (data.candidates && data.candidates[0]) {
      console.log("\n📝 Ответ:");
      console.log(data.candidates[0].content.parts[0].text);
      
      console.log("\n📊 Статистика:");
      console.log(`Токенов в запросе: ${data.usageMetadata.promptTokenCount}`);
      console.log(`Токенов в ответе: ${data.usageMetadata.candidatesTokenCount}`);
      console.log(`Модель: ${data.modelVersion}\n`);
    } else {
      console.log("❌ Нет данных в ответе");
    }
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

// Добавляем функцию обработки анализа
async function handleCodeAnalysis(chat, options) {
  const targetPath = options.path;
  const depth = parseInt(options.depth) || 3;
  const fixThreshold = parseInt(options.fix) || 0;
  const analysisTypes = options.types || ['--basic'];

  // Пример рекурсивного обхода
  // const files = options.recursive
  //   ? await getAllFilesRecursive(targetPath)
  //   : [targetPath];

  // Обрабатываем файлы и анализируем код
}

// Функция парсинга опций анализа
function parseAnalysisOptions(params) {
  const options = {
    path: params[0],
    types: [],
    fix: 0,
    depth: 0,
    recursive: false
  };

  return options;
}

async function main() {
  try {
    // Инициализируем chat один раз в начале
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

    if (args.length > 0) {
      const [command, ...params] = args;
      
      switch(command) {
        case 'chat':
          await runChat();
          break;
        case 'direct':
          await makeDirectRequest(params.join(' '));
          break;
        case 'code':
          await handleCodeGeneration(chat);
          break;
        case 'analyze':
          const options = parseAnalysisOptions(params);
          await handleCodeAnalysis(chat, options);
          break;
        default:
          console.log("❌ Неизвестная команда. Доступные команды: chat, direct, code, analyze");
      }
      rl.close();
      return;
    }

    console.log("\n🤖 Добро пожаловать в Gemini AI Assistant!");
    
    while (true) {
      console.log("\n=== Главное меню ===");
      console.log("1. 💭 Chat режим");
      console.log("2. 🚀 Прямой запрос");
      console.log("3. 👋 Выход");
      
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
          console.log("\n👋 До свидания!");
          rl.close();
          return;
        default:
          console.log("❌ Неверный выбор. Попробуйте снова.");
      }
    }
  } catch (error) {
    console.error("❌ Ошибка:", error);
  } finally {
    rl.close();
  }
}

main();

/*
Добавленные инструкции и примеры использования:

1. Рекурсивный анализ с автофиксом:
node src/main.js analyze ./src --recursive --fix=75 --all

2. Анализ до 2 уровня:
node src/main.js analyze ./src --depth=2 --basic --security

3. Анализ одного файла:
node src/main.js analyze ./src/main.js --file --complexity --fix=90
*/