/* global process */
import { ESLint } from "eslint";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import fs from "fs/promises"; // Добавлен импорт fs
import logger from "../utils/logger.js";
import { ProviderFactory } from "../services/providers/factory.js"; // Импортируем фабрику провайдеров
import { globby } from "globby"; // Убедитесь, что импортируете globby правильно

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(projectRoot, ".env") });

export default async function analyze(options) {
  try {
    const eslint = new ESLint(); // Удалено overrideConfig

    // Получение доступных провайдеров
    const providers = ProviderFactory.getAvailableProviders();
    logger.info('Доступные провайдеры:', providers.map(p => p.name).join(', '));
    
    if (!providers.length) {
      throw new Error('Нет настроенных провайдеров AI. Проверьте переменные окружения.');
    }
    
    // Создание провайдера на основе опций или первого доступного провайдера
    const providerName = options.provider || providers[0].name;
    logger.info(`Используемый провайдер: ${providerName}`);
    const provider = ProviderFactory.createProvider(providerName);

    // Безопасное получение путей с учетом корневой директории
    const filePaths =
      options.paths && options.paths.length
        ? options.paths.map((p) => path.resolve(projectRoot, p))
        : [path.resolve(projectRoot, "src")];

    logger.info("Resolved file paths:", filePaths); // Добавлено логирование разрешенных путей

    // Формируем паттерны для поиска файлов с абсолютными путями
    const patterns = filePaths.map((filePath) => {
      if (options.recursive && !filePath.includes("*")) {
        return path.join(filePath, "**/*.{js,jsx,ts,tsx}");
      }
      return filePath;
    });

    logger.info("Generated glob patterns:", patterns); // Добавлено логирование паттернов

    // Проверка наличия файлов перед анализом
    const files = await globby(patterns, {
      ignore: ["**/node_modules/**"],
      absolute: true,
    }); // Обновлено исключение node_modules и добавлен абсолютный путь
    logger.info("Files found by globby:", files); // Добавлено логирование найденных файлов

    if (files.length === 0) {
      logger.error(
        "Не найдено файлов для анализа по указанным путям:",
        patterns,
      );
      return;
    }

    const results = await eslint.lintFiles(files);

    // Используем AI анализ только если провайдер успешно инициализирован
    if (provider) {
      logger.info("Запуск AI анализа...");
      let analyzedFiles = 0;
      const maxRetries = 3;
      const delay = options.delay || 2000;
      const allAnalysis = []; // Новый массив для итогового отчета

      for (const file of files) {
        try {
          analyzedFiles++;
          logger.info(`Анализ файла (${analyzedFiles}/${files.length}): ${file}`);
          
          const content = await fs.readFile(file, 'utf8');
          logger.info(`Чтение файла: ${file}`); // Заменено debug на info
          
          // Добавляем повторные попытки при ошибках
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              // Таймаут для запроса
              const analysisPromise = provider.analyze(content);
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Таймаут запроса: 30 секунд')), 30000)
              );

              logger.info(`Попытка анализа ${attempt}/${maxRetries}...`);
              const aiAnalysis = await Promise.race([analysisPromise, timeoutPromise]);

              // Успешный анализ
              logger.info('-'.repeat(80));
              logger.info('Результат анализа:');
              logger.info(aiAnalysis);
              logger.info('-'.repeat(80));
              allAnalysis.push(`Файл: ${file}\n${aiAnalysis}`); // Добавлено в массив итогового отчета
              break;

            } catch (error) {
              if (attempt === maxRetries) {
                throw error;
              }
              logger.warn(`Ошибка попытки ${attempt}, повтор через 2 секунды...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

        } catch (error) {
          logger.error(`Ошибка анализа файла ${file}:`, error.message);
          if (error.response?.data) {
            logger.error("Детали ошибки API:", JSON.stringify(error.response.data, null, 2));
          }
          continue; // Продолжаем со следующим файлом
        }
      }

      // Финальное суммарное обращение к AI
      if (allAnalysis.length > 0) {
        logger.info("Создание сводного отчета AI...");
        const combinedAnalysis = allAnalysis.join("\n\n");

        // Итоговый отчет на русском языке с оформлением
        const summaryPromptRu = `
        Пожалуйста, подведите итоги следующих анализов в один связный отчет, красиво оформленный в цветах, тонах и с пиктограммами для четабельного представления. Итоговый отчет должен быть на русском языке:
        
        **Итоговый отчет анализа кода**

        **Цветовая схема:**

        * Зеленый: Положительные результаты
        * Желтый: Требуется внимание
        * Красный: Ошибки

        **Пиктограммы:**

        * ✅ Успешно
        * ⚠️ Требуется внимание
        * ❌ Ошибка

        **Анализ с использованием искусственного интеллекта**

        **Анализируемые файлы:**

        ${combinedAnalysis}

        **Итоговый отчет:**

        **Файл 1**

        - Отчет для файла 1
        - Проблемы:
          - Предупреждения: <Список предупреждений>
          - Ошибки: <Список ошибок>
        - Рекомендации: <Список рекомендаций AI>

        **Файл 2**

        - Отчет для файла 2
        - Проблемы:
          - Предупреждения: <Список предупреждений>
          - Ошибки: <Список ошибок>
        - Рекомендации: <Список рекомендаций AI>

        **Сводный отчет**

        **Проблемы:**

        * **Предупреждения:**
          * Общее количество: <Число предупреждений>
          * Наиболее распространенные: <Список наиболее распространенных предупреждений>
        * **Ошибки:**
          * Общее количество: <Число ошибок>
          * Наиболее распространенные: <Список наиболее распространенных ошибок>

        **Рекомендации**

        * Общие рекомендации: <Список общих рекомендаций AI>
        * Рекомендации по стилю: <Список рекомендаций AI по стилю>
        * Рекомендации по производительности: <Список рекомендаций AI по производительности>

        **Заключение**

        Анализ кода завершен. Обнаружены следующие проблемы:

        * Предупреждения: <Число предупреждений>
        * Ошибки: <Число ошибок>

        Рекомендуется обратить внимание на рекомендации ИИ, чтобы улучшить качество кода.
        `;
        const finalReportRu = await provider.analyze(summaryPromptRu);
        logger.info("Итоговый отчет по анализу (Русский):\n" + finalReportRu);
      }

      logger.info(`\nАнализ завершен. Обработано файлов: ${analyzedFiles}`);
    }

    if (options.fix) {
      await ESLint.outputFixes(results);
    }
    const formatter = await eslint.loadFormatter("stylish");
    logger.info(formatter.format(results));
  } catch (error) {
    logger.error("Ошибка анализа:", error);
    process.exit(1);
  }
}
