const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
require('dotenv').config();

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

async function runChat() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const chat = model.startChat({
    generationConfig: {
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = await chat.sendMessage("Напиши простую функцию на JavaScript");
  const response = await result.response;
  console.log(response.text());
}

// Альтернативная функция с использованием fetch
async function makeDirectRequest(prompt) {
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
}

runChat();
// Раскомментируйте следующую строку для тестирования прямого API запроса
// makeDirectRequest("Explain how AI works");
```
runChat();