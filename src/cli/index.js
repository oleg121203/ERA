#!/usr/bin/env node
import { Command } from "commander";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import Environment from "../utils/environment.js";
import analyze from "../commands/analyze.js";
import format from "../commands/format.js";
import fix from "../commands/fix.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "../../");

// Инициализация окружения
const env = new Environment(projectRoot);

async function main() {
  try {
    // Проверка окружения
    if (!(await env.isActive())) {
      logger.warn("Окружение не активировано");
      await env.activate();
    }

    const program = new Command();

    program.version("1.0.0").description("ERA CLI инструменты");

    program
      .command("analyze")
      .description("Анализ кода")
      .option("-f, --fix", "Автоисправление")
      .option("-r, --recursive", "Рекурсивный анализ")
      .option(
        "-p, --provider <provider>",
        "AI провайдер (gemini, mistral)",
        "none",
      )
      .option(
        "--paths <paths>",
        "Пути для анализа, разделенные запятыми",
        (value) => value.split(","),
      )
      .option(
        "--delay <delay>",
        "Задержка между анализом файлов в миллисекундах",
        parseInt,
      )
      .option("--verbose", "Включить подробное логирование") // Добавлено
      .action(analyze);

    program
      .command("format")
      .description("Форматирование")
      .option("-w, --write", "Сохранить изменения")
      .option(
        "--paths <paths>",
        "Пути для форматирования, разделенные запятыми",
        (value) => value.split(","),
      )
      .option("--verbose", "Включить подробное логирование") // Добавлено
      .action(format);

    program.command("fix").description("Исправить всё").action(fix);

    // Добавляем команду analyze-format
    program
      .command("analyze-format")
      .description("Форматирование и анализ кода")
      .option("-f, --fix", "Автоисправление")
      .option("-r, --recursive", "Рекурсивный анализ")
      .option(
        "-p, --provider <provider>",
        "AI провайдер (gemini, mistral)",
      )
      .option(
        "--paths <paths>",
        "Пути для форматирования и анализа, разделенные запятыми",
        (value) => value.split(","),
      )
      .option(
        "--delay <delay>",
        "Задержка между анализом файлов в миллисекундах",
        parseInt,
      )
      .option("--verbose", "Включить подробное логирование") // Добавлено
      .action(async (options) => {
        if (options.verbose) {
          logger.level = "debug"; // Установите уровень логирования на debug
        }
        await format(options);
        if (options.delay) {
          logger.info(`Задержка перед анализом: ${options.delay} мс`);
          await new Promise((resolve) => setTimeout(resolve, options.delay));
        }
        await analyze(options);
      });

    program.parse(process.argv);
  } catch (error) {
    logger.error("Ошибка инициализации:", error);
    process.exit(1);
  }
}

main();
