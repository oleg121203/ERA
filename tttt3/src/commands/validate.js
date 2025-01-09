import analyze from "./analyze.js";
import format from "./format.js";
import logger from "../utils/logger.js";

export default async function validate(options) {
  try {
    logger.info("Запуск полной проверки кода...");

    // Сначала форматируем код
    logger.info("\n1. Форматирование кода:");
    await format({ write: true });

    // Затем анализ кода с AI (или без)
    logger.info("\n2. Анализ кода с AI:");
    await analyze({
      fix: true,
      recursive: true,
      paths: ["src"],
      provider: options.provider || "mistral",
    });

    logger.success("\n✓ Проверка кода успешно завершена");
  } catch (error) {
    logger.error("Ошибка при проверке кода:", error);
    process.exit(1);
  }
}
