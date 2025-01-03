const { ANALYSIS_TYPES, FORMATTERS } = require("./constants");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const config = require("./config/gemini.config");
const logger = require('./utils/logger');

class CodeAnalyzer {
  constructor(chat, options = {}) {
    this.chat = chat;
    this.options = options;
    this.genAI = new GoogleGenerativeAI(config.apiKey, {
      apiEndpoint: config.endpoint,
      timeout: 30000,
    });
    this.fixes = [];
  }

  async analyze(code, options) {
    const results = [];
    const types = this.parseTypes(options.types);

    // Запускаем форматирование перед анализом если указан флаг
    if (options.format) {
      await this.formatCode(code);
    }

    for (const { type, metrics } of types) {
      if (!ANALYSIS_TYPES[type]) {
        console.log(`Skipping unknown type: ${type}`);
        continue;
      }

      // Выполняем специфические проверки в зависимости от типа
      const specificChecks = await this.runSpecificChecks(code, type);
      const analysis = await this.analyzeByType(code, type, metrics);

      logger.log(
        `\n[${type}] Текущее значение confidence: ${analysis.confidence}, порог fix: ${options.fix}`,
      );
      logger.log(
        `\n[${type}] autoApply: ${options.autoApply}, confidence: ${analysis.confidence}, fix: ${options.fix}`,
      );
      // Применяем исправления если включен autoApply
      if (options.autoApply && analysis.confidence >= options.fix) {
        logger.log(`🔧 Применяем исправления для типа: ${type}`);
        const fixes = await this.applyFixes(code, analysis, type);
        analysis.appliedFixes = fixes;
        logger.log(`[${type}] Исправления применены (фикс >= порога).`);
      } else {
        logger.log(`[${type}] Исправления не применены (фикс < порога).`);
      }

      results.push({
        ...analysis,
        specificChecks,
        formattingApplied: options.format,
        fixesApplied: this.fixes.length,
      });
    }
    return results;
  }

  parseTypes(typesStr) {
    if (!typesStr || typesStr.trim() === "") {
      logger.log("🔍 Используется базовый тип анализа");
      return [{ type: "--basic", metrics: {} }];
    }

    // Разбиваем строку типов по запятой
    const typesArray = typesStr
      .split(",")
      .map((type) => type.trim())
      .filter((type) => type !== "");
    logger.log("📋 Полученные типы анализа:", typesArray);

    const analysisTypes = typesArray.map((typeStr) => {
      const [typeRaw, ...metricsArr] = typeStr.split(":");
      const type = typeRaw.replace(/^--/, "");
      const metrics = this.parseMetrics(metricsArr.join(":"));

      logger.log(`🔍 Разбор типа ${type}:`, { metrics });
      return {
        type: `--${type}`,
        metrics,
      };
    });

    // Проверяем валидность типов
    const validTypes = analysisTypes.filter(({ type }) => ANALYSIS_TYPES[type]);
    if (validTypes.length !== analysisTypes.length) {
      console.warn("⚠️ Обнаружены неизвестные типы анализа!");
    }

    return validTypes;
  }

  parseMetrics(metricsStr) {
    if (!metricsStr) return {};

    // Используем регулярные выражения для парсинга метрик
    const regex = /(\w+)=(\d+)/g;
    const metrics = {};
    let match;
    while ((match = regex.exec(metricsStr)) !== null) {
      metrics[match[1]] = parseInt(match[2], 10);
    }
    return metrics;
  }

  async analyzeByType(code, type, metrics = {}) {
    const typeConfig = ANALYSIS_TYPES[type];
    logger.log(`\n📊 Анализ типа ${type}`);

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      });

      try {
        // Применяем форматирование
        if (typeConfig.formatters && this.options.format) {
          await this.applyFormatters(type, typeConfig.formatters);
        }

        // Подготавливаем и проверяем промпт
        const prompt = this.buildPrompt(code, typeConfig, metrics);
        if (!prompt.trim()) {
          throw new Error("Empty prompt generated");
        }

        // Отправляем запрос с обработкой ошибок безопасности
        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (!response) {
          throw new Error("Empty response from AI");
        }

        // Используем переданные метрики или значения по умолчанию
        const confidence =
          metrics.confidence || typeConfig.metrics.confidence.CERTAIN;
        const impact = metrics.impact || typeConfig.metrics.impact.CRITICAL;
        const priority =
          metrics.priority || typeConfig.metrics.priority.IMMEDIATE;

        logger.log(`Результаты анализа:
          - Confidence: ${confidence}
          - Impact: ${impact}
          - Priority: ${priority}
          `);

        return {
          type,
          analysis: response.text(),
          confidence,
          impact,
          priority,
        };
      } catch (error) {
        logger.error(`Error in analyzeByType for type ${type}: ${error.message}`);
        return {
          type,
          analysis: `Analysis failed: ${error.message}`,
          confidence: typeConfig.metrics.confidence.CERTAIN,
          impact: typeConfig.metrics.impact.CRITICAL,
          priority: typeConfig.metrics.priority.IMMEDIATE,
          error: true,
        };
      }
    } catch (error) {
      logger.error(`Error in analyzeByType for type ${type}: ${error.message}`);
      throw error; // Пробрасываем ошибку выше для правильной обработки
    }
  }

  async applyFormatters(type, formatters) {
    logger.log(`🔧 Применяем форматтеры для ${type}...`);
    const filePath = this.options.filePath;
    const extension = path.extname(filePath);

    for (const formatter of formatters) {
      const config = FORMATTERS[formatter];
      if (config && config.extensions.includes(extension)) {
        try {
          logger.log(`   Running ${formatter}...`);
          const command = `${config.command} ${config.args.join(" ")} "${filePath}"`;
          execSync(command, { stdio: "pipe" });
          logger.log(`   ✅ ${formatter} completed`);
        } catch (error) {
          console.warn(`⚠️  Formatter ${formatter} failed:`, error.message);
        }
      }
    }
  }

  getFilePath(code, specifiedPath) {
    // Позволяем пользователю указывать путь к файлу или определяем его из контекста
    return specifiedPath || "src/main.js"; // Пример
  }

  buildPrompt(code, typeConfig, metrics = {}) {
    // Убираем чувствительные данные из кода
    const sanitizedCode = this.sanitizeCode(code);

    const prompt = [
      "Analyze the following code:",
      "",
      `Analysis type: ${typeConfig.name}`,
      `Focus: ${typeConfig.desc}`,
      "",
      "Code:",
      "```javascript",
      sanitizedCode,
      "```",
      "",
      "Provide a technical analysis covering:",
      "1. Code quality score (0-100)",
      "2. Specific issues found",
      "3. Concrete improvement suggestions",
      "4. Code examples for fixes",
      typeConfig.depth === "deep" ? "5. Architecture recommendations" : "",
      "",
      "Format response as valid JSON",
    ]
      .filter(Boolean)
      .join("\n");

    return prompt;
  }

  sanitizeCode(code) {
    // Удаляем потенциально чувствительные данные
    return code
      .replace(/const API_KEY\s*=\s*["'].*["']/g, 'const API_KEY = "***"')
      .replace(/password\s*:\s*["'].*["']/g, 'password: "***"');
  }

  parseResult(result, type) {
    if (!result?.response) {
      throw new Error("Invalid analysis result");
    }

    const typeConfig = ANALYSIS_TYPES[type];
    return {
      type,
      analysis: result.response.text(),
      confidence: typeConfig.metrics.confidence.CERTAIN,
      impact: typeConfig.metrics.impact.CRITICAL,
      priority: typeConfig.metrics.priority.IMMEDIATE,
    };
  }

  async runSpecificChecks(code, type) {
    const checks = {};

    if (type === "--security") {
      checks.sqlInjection = this.checkSQLInjection(code);
      checks.xss = this.checkXSS(code);
      checks.unsafeEval = this.checkUnsafeEval(code);
    } else if (type === "--performance") {
      checks.complexity = this.checkComplexity(code);
      checks.memoryUsage = this.checkMemoryUsage(code);
    } else if (type === "--syntax") {
      checks.syntax = this.checkSyntax(code);
      checks.style = this.checkStyle(code);
    }

    return checks;
  }

  checkSQLInjection(code) {
    const risks = [];
    if (code.includes("executeQuery(") && !code.includes("prepared")) {
      risks.push("Possible SQL injection: Use prepared statements");
    }
    return risks;
  }

  checkXSS(code) {
    const risks = [];
    if (
      code.includes("innerHTML") ||
      code.includes("dangerouslySetInnerHTML")
    ) {
      risks.push("XSS risk: Use safe DOM manipulation methods");
    }
    return risks;
  }

  checkUnsafeEval(code) {
    const risks = [];
    if (code.includes("eval(") || code.includes("new Function(")) {
      risks.push("Unsafe eval: Consider alternative approaches");
    }
    return risks;
  }

  // Добавляем метод checkComplexity
  checkComplexity(code) {
    const complexities = [];
    const complexityMatches = code.match(/function\s+\w+\s*\(/g) || [];
    complexities.push(`Найдено ${complexityMatches.length} функций.`);
    return complexities;
  }

  // Добавляем метод checkMemoryUsage
  checkMemoryUsage(code) {
    const memoryIssues = [];
    const memoryPatterns = [
      /process\.memoryUsage\(\)/g,
      /new\s+Buffer\(/g,
      /new\s+ArrayBuffer\(/g,
    ];

    memoryPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        memoryIssues.push(
          `Использование ${match[0].replace(/\(/, "")} может привести к высоким расходам памяти.`,
        );
      }
    });

    return memoryIssues;
  }

  checkSyntax(code) {
    const issues = [];
    try {
      // Проверка базового синтаксиса
      Function(code);
    } catch (error) {
      issues.push({
        type: 'syntax-error',
        message: error.message,
        line: error.lineNumber
      });
    }
    return issues;
  }

  checkStyle(code) {
    const styleIssues = [];
    const patterns = [
        { regex: /\t/g, message: "Tabs found, use spaces instead" },
        { regex: /\s+$/gm, message: "Trailing whitespace found" },
        { regex: /[^\n]\n*$/g, message: "Missing newline at end of file" },
        { regex: /[;,]\s*\n\s*[}\]]/, message: "Trailing comma style violation" }
    ];

    patterns.forEach(({ regex, message }) => {
        if (regex.test(code)) {
            styleIssues.push({ type: 'style', message });
        }
    });

    return styleIssues;
  }

  async applyFixes(code, analysis, type) {
    logger.log(`\n[${type}] Начало применения исправлений...`);

    try {
      // Проверяем API ключ перед применением исправлений
      if (!(await config.validate())) {
        throw new Error("Недействительный API ключ");
      }

      const fixes = [];
      const filePath = this.options.filePath;

      try {
        // Проверяем метрики и API ключ
        logger.log(`Проверка метрик:
            - Confidence: ${analysis.confidence}
            - Impact: ${analysis.impact}
            - Priority: ${analysis.priority}
            - Порог исправлений: ${this.options.fix}
            - AutoApply: ${this.options.autoApply}
            `);

        if (!this.options.autoApply || analysis.confidence < this.options.fix) {
          logger.log(
            "❌ Исправления не будут применены: недостаточный confidence или отключен autoApply",
          );
          return [];
        }

        // Анализируем текущий код
        const issues = await this.analyzeCodeIssues(code, type);
        if (!issues || issues.length === 0) {
          logger.log("✅ Проблем не обнаружено, исправления не требуются");
          return [];
        }

        logger.log(`🔍 Найдено проблем: ${issues.length}`);

        // Применяем исправления для каждой проблемы
        for (const issue of issues) {
          try {
            const fix = await this.generateFix(code, issue, type);
            if (fix && fix.fixedCode) {
              // Сохраняем бэкап если нужно
              if (this.options.backup) {
                await fs.writeFile(`${filePath}.backup`, code, "utf8");
              }

              // Применяем исправление
              await fs.writeFile(filePath, fix.fixedCode, "utf8");
              fixes.push({
                type: issue.type,
                description: issue.description,
                applied: true,
                timestamp: new Date().toISOString(),
                confidence: analysis.confidence,
                impact: analysis.impact,
              });
            }
          } catch (error) {
            logger.error(
              `Ошибка при исправлении проблемы ${issue.type}: ${error.message}`,
            );
          }
        }

        if (fixes.length > 0) {
          logger.log(`✅ Успешно применено исправлений: ${fixes.length}`);
          this.fixes.push(...fixes);
        }

        return fixes;
      } catch (error) {
        logger.error("Ошибка при применении исправлений:", error.message);
        return [];
      }
    } catch (error) {
      logger.error("Ошибка при применении исправлений:", error.message);
      throw error; // Пробрасываем ошибку выше
    }
  }

  async analyzeCodeIssues(code, type) {
    try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        // Определяем промпт в зависимости от типа анализа
        let prompt = '';
        
        if (type === '--syntax') {
            prompt = `Analyze this code for syntax and style issues:
${code}

Return response in this exact JSON format:
{
    "issues": [
        {
            "type": "syntax|style",
            "description": "string",
            "severity": "high|medium|low",
            "line": "number",
            "suggestion": "string"
        }
    ]
}`;
        } else {
            // Промпты для других типов анализа
            prompt = `Analyze this code for general issues:
${code}

Return response in JSON format.`;
        }

        // Отправляем запрос к API
        const result = await model.generateContent({
            contents: [{ parts: [{ text: prompt }] }]
        });

        if (!result.response) {
            logger.log("Нет ответа от API");
            return [];
        }

        const text = result.response.text();

        // Извлекаем JSON из ответа
        const jsonMatch = text.match(/\{[\с\S]*\}/);
        if (!jsonMatch) {
            console.warn("Не удалось найти JSON в ответе:", text);
            return [];
        }

        const response = JSON.parse(jsonMatch[0]);
        return response.issues || [];
        
    } catch (error) {
        logger.error("Ошибка при анализе кода:", error.message);
        return [];
    }
}

  async generateFix(code, issue, type) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent({
        contents: [
          {
            parts: [
              {
                text: `Fix this code issue:
                    Issue: ${issue.description}
                    Type: ${type}
                    
                    Original code:
                    ${code}
                    
                    Return response in this exact JSON format:
                    {
                        "fixedCode": "string (complete fixed code)",
                        "explanation": "string"
                    }`,
              },
            ],
          },
        ],
      });

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\с\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error("Ошибка при генерации исправления:", error.message);
      return null;
    }
  }

  async getSecurityFix(code, type, analysis) {
    const prompt = [
      "Please provide specific security fixes for the following code:",
      "```javascript",
      code,
      "```",
      `Current metrics:`,
      `- Confidence: ${analysis.confidence}`,
      `- Impact: ${analysis.impact}`,
      `- Priority: ${analysis.priority}`,
      "",
      "Return response as JSON with fields:",
      "- fixedCode: string",
      "- changes: string[]",
    ].join("\n");

    const result = await this.chat.sendMessage(prompt);
    try {
      const response = JSON.parse(result.response.text());
      return {
        fixedCode: response.fixedCode,
        changes: response.changes,
      };
    } catch (error) {
      logger.error("Ошибка парсинга ответа AI:", error);
      return null;
    }
  }

  async getPerformanceFix(code, checks) {
    if (checks.complexity.length === 0 && checks.memoryUsage.length === 0) {
      return null;
    }

    const prompt = [
      "Optimize the following code for performance:",
      "```javascript",
      code,
      "```",
      "Issues to address:",
      ...checks.complexity,
      ...checks.memoryUsage,
    ].join("\n");

    try {
      const result = await this.chat.sendMessage(prompt);
      return {
        type: "performance",
        issues: [...checks.complexity, ...checks.memoryUsage],
        fixedCode: result.response.text(),
        applied: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Ошибка при получении оптимизаций:", error);
      return null;
    }
  }

  async formatCode(code) {
    const filePath = this.options.filePath;
    logger.log(`\n🔧 Форматирование файла: ${filePath}`);
    const extension = path.extname(filePath);

    for (const [name, config] of Object.entries(FORMATTERS)) {
      try {
        if (config.extensions.includes(extension)) {
          logger.log(`   Применяем ${name}...`);
          const command = `${config.command} ${config.args.join(" ")} "${filePath}"`;
          execSync(command, { stdio: "pipe" });
          logger.log(`   ✅ ${name} completed`);
        }
      } catch (error) {
        console.warn(`⚠️  Форматтер ${name} failed:`, error.message);
      }
    }
  }
}

module.exports = CodeAnalyzer;
