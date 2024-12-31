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
    console.log("- Задавайте вопросы на любом языке");
    console.log("- Используйте 'exit' для возврата в главное меню");
    console.log("- Для генерации кода укажите язык программирования\n");

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
      if (prompt.toLowerCase() === 'exit') break;

      console.log("\n⏳ Генерирую ответ...");
      const result = await chat.sendMessage(prompt);
      console.log("\n📝 Ответ:\n" + result.response.text() + "\n");
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
    console.log(data);
  } catch (error) {
    console.error("Error in makeDirectRequest:", error);
  }
}

async function main() {
  try {
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