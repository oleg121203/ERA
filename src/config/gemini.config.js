const path = require("path");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const logger = require('../utils/logger');

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (dotenv.error) {
  logger.error(`Ошибка загрузки .env файла: ${dotenv.error.message}`);
}

const config = {
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-pro",
  endpoint: "https://generativelanguage.googleapis.com/v1beta",

  async validate() {
    if (!this.apiKey) {
      logger.error("❌ GEMINI_API_KEY не установлен в .env файле");
      return false;
    }

    const maskedKey = `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`;
    logger.log(`🔑 Проверка API ключа: ${maskedKey}`);

    try {
      const url = `${this.endpoint}/models/gemini-pro?key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API ключ недействителен: ${response.statusText}`);
      }

      logger.log("✅ API ключ успешно валидирован");
      return true;
    } catch (error) {
      logger.error(`Ошибка при проверке API ключа: ${error}`);
      return false;
    }
  },

  getApiUrl(model = "gemini-pro") {
    return `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`;
  },
};

module.exports = config;
