import analyze from "./analyze.js";
import format from "./format.js";
import logger from "./logger.js";  // Assuming logger.js is moved to the same directory

export default async function fix() {
  try {
    logger.info("Запуск полного исправления кода...");

    // Запускаем ESLint с автоисправлением
    await analyze({
      fix: true,
      recursive: true,
      paths: ["src"],
      provider: "none",
    });

    // Запускаем Prettier с записью изменений
    await format({ write: true });

    logger.success("✓ Код успешно исправлен и отформатирован");
  } catch (error) {
    logger.error("Ошибка при исправлении кода:", error);
    import process from "node:process";  // Explicitly import the process module
process.exit(1);
  }
}
