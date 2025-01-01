const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const readline = require("readline");
const fs = require("fs").promises;
const path = require("path");
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

const helpCommands = {
  "/help": "Показать список команд",
  "/code": "Режим генерации кода",
  "/explain": "Объяснить концепцию",
  "/exit": "Выход в главное меню",
};

// Добавляем константы для интерактивного режима
const INTERACTIVE_FLAGS = ["-i", "--interactive"];
const AUTO_APPLY_FLAG = '--auto-apply';

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

      switch (prompt.toLowerCase()) {
        case "/help":
          await showHelp();
          break;
        case "/code":
          await handleCodeGeneration(chat);
          break;
        case "/exit":
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
    const data = await response.json();

    // Форматируем и выводим ответ
    if (data.candidates && data.candidates[0]) {
      console.log("\n📝 Ответ:");
      console.log(data.candidates[0].content.parts[0].text);

      console.log("\n📊 Статистика:");
      console.log(`Токенов в запросе: ${data.usageMetadata.promptTokenCount}`);
      console.log(
        `Токенов в ответе: ${data.usageMetadata.candidatesTokenCount}`
      );
      console.log(`Модель: ${data.modelVersion}\n`);
    } else {
      console.log("❌ Нет данных в ответе");
    }
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

// Обновляем функцию getAllFilesRecursive с правильной обработкой ошибок
async function getAllFilesRecursive(dir) {
  const files = [];

  async function scan(currentPath) {
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
      console.error(
        `❌ Ошибка при сканировании ${currentPath}:`,
        error.message
      );
    }
  }

  try {
    await fs.access(dir); // Проверяем существование директории
    await scan(dir);
    return files;
  } catch (error) {
    throw new Error(`Директория ${dir} не найдена или недоступна`);
  }
}

// Обновляем функцию handleCodeAnalysis
async function handleCodeAnalysis(chat, options, interactiveOptions = null) {
  try {
    const targetPath = options.path || "."; // Добавляем значение по умолчанию
    const depth = options.depth || 3;
    const fixThreshold = options.fix || 70; // Устанавливаем порог автофикса по умолчанию на 70%
    const analysisTypes = options.types || ["--basic"];

    // Получаем список файлов
    let files = [];
    if (options.recursive) {
      console.log("🔍 Сканирование директории...");
      files = await getAllFilesRecursive(targetPath);
    } else {
      const stat = await fs.stat(targetPath);
      files = stat.isDirectory()
        ? (await fs.readdir(targetPath)).map((f) => path.join(targetPath, f))
        : [targetPath];
    }

    console.log(`\n📁 Найдено файлов: ${files.length}`);

    // Анализируем каждый файл
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = Math.round(((i + 1) / files.length) * 100);

      if (interactiveOptions?.interactive) {
        interactiveOptions.onProgress(path.basename(file), progress);
      }

      console.log(`\n📄 Анализ файла (${i + 1}/${files.length}): ${file}`);

      try {
        const code = await fs.readFile(file, "utf8");
        const analyzer = new CodeAnalyzer(chat);
        const result = await analyzer.analyze(code, { types: analysisTypes });

        if (interactiveOptions?.interactive) {
          interactiveOptions.onResult(path.basename(file), result);
        } else {
          console.log("\n📊 Результаты анализа:");
          console.log(result);
        }

        // Проверка уверенности модели перед автофиксом
        const confidentResults = result.filter(
          (r) => r.confidence >= fixThreshold
        );
        if (
          confidentResults.length > 0 &&
          result.some((r) => r.priority >= fixThreshold)
        ) {
          console.log(`\n🔧 Автофикс для файла ${file}`);

          const fixPrompt = `
            Исправь следующие проблемы в коде:
            ${confidentResults.map((r) => r.analysis).join("\n")}
            
            Код для исправления:
            ${code}
            
            Верни только исправленный код без пояснений.
          `;

          const fixResult = await chat.sendMessage(fixPrompt);
          const fixedCode = fixResult.response.text();

          console.log("\n📝 Предлагаемые исправления:");
          console.log(fixedCode);

          if (options.autoApply) {
            await fs.writeFile(file, fixedCode, "utf8");
            console.log("✅ Исправления применены автоматически");
          } else {
            const shouldApply = await promptUser(
              "\n✔️ Применить исправления? (y/n): "
            );
            if (shouldApply.toLowerCase() === "y") {
              await fs.writeFile(file, fixedCode, "utf8");
              console.log("✅ Исправления применены");
            } else {
              console.log("❌ Исправления отменены");
            }
          }
        } else if (result.some((r) => r.priority >= fixThreshold)) {
          console.log(`\n🔧 Автофикс для файла ${file} требует подтверждения`);

          const fixPrompt = `
            Исправь следующие проблемы в коде:
            ${result.map((r) => r.analysis).join("\n")}
            
            Код для исправления:
            ${code}
            
            Верни только исправленный код без пояснений.
          `;

          const fixResult = await chat.sendMessage(fixPrompt);
          const fixedCode = fixResult.response.text();

          console.log("\n📝 Предлагаемые исправления:");
          console.log(fixedCode);

          const shouldApply = await promptUser(
            "\n✔️ Применить исправления? (y/n): "
          );
          if (shouldApply.toLowerCase() === "y") {
            await fs.writeFile(file, fixedCode, "utf8");
            console.log("✅ Исправления применены");
          } else {
            console.log("❌ Исправления отменены");
          }
        }
      } catch (err) {
        console.error(`❌ Ошибка при анализе ${file}:`, err.message);
      }
    }

    console.log("\n✅ Анализ завершен");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    if (process.env.DEBUG) {
      console.error("Stack:", error.stack);
    }
  }
}

// Функция парсинга опций анализа
function parseAnalysisOptions(params) {
  const options = {
    path: params[0],
    types: [],
    fix: 0,
    depth: 0,
    recursive: false,
    autoApply: false
  };

  params.slice(1).forEach((param) => {
    if (param === AUTO_APPLY_FLAG) {
      options.autoApply = true;
    } else {
      const [type, metrics] = param.split(":");
      if (ANALYSIS_TYPES[type]) {
        const metricsObj = metrics.split(",").reduce((acc, metric) => {
          const [key, value] = metric.split("=");
          acc[key] = parseInt(value) === 0 ? null : parseInt(value);
          return acc;
        }, {});
        options.types.push({ type, metrics: metricsObj });
      } else if (type === "--fix") {
        options.fix = parseInt(metrics) === 0 ? null : parseInt(metrics);
      } else if (type === "--depth") {
        options.depth = parseInt(metrics) === 0 ? null : parseInt(metrics);
      } else if (type === "--recursive") {
        options.recursive = true;
      }
    }
  });

  return options;
}

// Обновляем main() для поддержки интерактивного режима
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
      const isInteractive = params.some((p) => INTERACTIVE_FLAGS.includes(p));
      const cleanParams = params.filter((p) => !INTERACTIVE_FLAGS.includes(p));

      switch (command) {
        case "chat":
          await runChat();
          break;
        case "direct":
          await makeDirectRequest(params.join(" "));
          break;
        case "code":
          await handleCodeGeneration(chat);
          break;
        case "analyze":
          const options = parseAnalysisOptions(cleanParams);
          if (isInteractive) {
            console.log("\n📊 Интерактивный режим анализа\n");
            console.log("Нажмите Ctrl+C для выхода\n");

            await handleCodeAnalysis(chat, options, {
              interactive: true,
              onProgress: (file, progress) => {
                console.log(`Анализ ${file}: ${progress}%`);
              },
              onResult: (file, result) => {
                console.log(`\n📝 Результат для ${file}:`);
                console.log(result);
              },
            });
          } else {
            await handleCodeAnalysis(chat, options);
          }
          break;
        default:
          console.log(
            "❌ Неизвестная команда. Доступные команды: chat, direct, code, analyze"
          );
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
node src/main.js analyze ./src --recursive --fix=75 --all --auto-apply

2. Анализ до 2 уровня с подтверждением:
node src/main.js analyze ./src --depth=2 --basic --security

3. Анализ одного файла с автоподтверждением:
node src/main.js analyze ./src/main.js --file --complexity --fix=90 --auto-apply

4. Анализ с автоисправлением при 70%:
node src/main.js analyze ./src/main.js --security:c=90:i=80:p=85 --basic:c=75:i=60:p=70 --perf:c=80:i=70:p=75 --fix=70 --auto-apply

### Параметры командной строки:

--auto-apply     Автоматическое применение исправлений без запроса подтверждения
--fix=N          Порог уверенности для применения исправлений (0-100)
--depth=N        Глубина анализа директории (1-3)
--recursive      Рекурсивный анализ всех файлов
*/
