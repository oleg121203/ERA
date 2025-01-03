const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../src/config/gemini.config");

async function testGeminiAPI() {
  try {
    config.validate();

    console.log(
      "Проверка API ключа:",
      config.apiKey ? "***" + config.apiKey.slice(-4) : "отсутствует",
    );

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.modelName });

    const result = await model.generateContent("тест");
    const response = await result.response;

    console.log("Ответ API получен:", response ? "успешно" : "ошибка");
    return true;
  } catch (error) {
    console.error("Ошибка при тестировании API:", error.message);
    if (config.debug) {
      console.error("Детали ошибки:", error);
    }
    return false;
  }
}

module.exports = { testGeminiAPI };
