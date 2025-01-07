import prettier from "prettier";
// import { glob } from "glob"; // Удалите этот импорт
import { globby } from "globby"; // Добавьте импорт globby
import { readFile, writeFile } from "fs/promises";
import logger from "../utils/logger.js";

export default async function format(options) {
  try {
    const patterns = options.paths
      ? options.paths.map((p) => `${p}/**/*.{js,json,md}`)
      : ["src/**/*.{js,json,md}"];
    logger.info("Форматируем файлы по паттернам:", patterns);

    const files = await globby(patterns); // Замените glob на globby

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const formatted = await prettier.format(content, {
        filepath: file,
      });

      if (options.write) {
        await writeFile(file, formatted);
        logger.success(`Отформатирован: ${file}`);
      } else {
        logger.info(formatted);
      }
    }
  } catch (error) {
    logger.error("Ошибка форматирования:", error);
    process.exit(1);
  }
}
