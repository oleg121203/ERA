const { ANALYSIS_TYPES, FORMATTERS } = require("./constants");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const config = require("./config/gemini.config");

class CodeAnalyzer {
  constructor(chat, options = {}) {
    this.chat = chat;
    this.options = options;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
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

      // Применяем исправления если включен autoApply
      if (options.autoApply && analysis.confidence >= options.fix) {
        console.log(`🔧 Применяем исправления для типа: ${type}`);
        const fixes = await this.applyFixes(code, specificChecks, type);
        analysis.appliedFixes = fixes;
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

  parseTypes(types) {
    if (!types || types.length === 0) {
      return [{ type: "--basic", metrics: {} }];
    }

    const analysisTypes = types.map((typeStr) => {
      const [typeRaw, metricsStr] = typeStr.split(":");
      // Убираем префикс '--' если он есть
      const type = typeRaw.replace(/^--/, "");
      return {
        type: `--${type}`, // Добавляем префикс обратно в стандартном формате
        metrics: this.parseMetrics(metricsStr),
      };
    });

    // Проверяем наличие базового или глубокого анализа
    const hasBase = analysisTypes.some(
      (t) => t.type === "--basic" || t.type === "--deep",
    );

    if (!hasBase) {
      analysisTypes.unshift({ type: "--basic", metrics: {} });
    }

    return analysisTypes;
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

      const model = this.genAI.getGenerativeModel({ 
        model: config.modelName,
        apiEndpoint: config.endpoint 
      });

      // Отправляем запрос с обработкой ошибок безопасности
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response) {
        throw new Error("Empty response from AI");
      }

      return {
        type,
        analysis: response.text(),
        confidence: typeConfig.metrics.confidence.CERTAIN,
        impact: typeConfig.metrics.impact.CRITICAL,
        priority: typeConfig.metrics.priority.IMMEDIATE,
      };
    } catch (error) {
      console.error(`Error in analyzeByType for type ${type}:`, error.message);
      return {
        type,
        analysis: `Analysis failed: ${error.message}`,
        confidence: typeConfig.metrics.confidence.CERTAIN,
        impact: typeConfig.metrics.impact.CRITICAL,
        priority: typeConfig.metrics.priority.IMMEDIATE,
        error: true,
      };
    }
  }

  async applyFormatters(type, formatters) {
    console.log(`🔧 Применяем форматтеры для ${type}...`);
    const filePath = this.options.filePath;
    const extension = path.extname(filePath);

    for (const formatter of formatters) {
      const config = FORMATTERS[formatter];
      if (config && config.extensions.includes(extension)) {
        try {
          console.log(`   Running ${formatter}...`);
          const command = `${config.command} ${config.args.join(" ")} "${filePath}"`;
          execSync(command, { stdio: "pipe" });
          console.log(`   ✅ ${formatter} completed`);
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

  async applyFixes(code, checks, type) {
    const fixes = [];
    const filePath = this.options.filePath;

    try {
      if (type === "--security") {
        for (const [checkName, risks] of Object.entries(checks)) {
          if (risks.length > 0) {
            const fix = await this.getSecurityFix(code, checkName, risks);
            if (fix && fix.fixedCode) {
              // Применяем исправление к файлу
              await fs.writeFile(filePath, fix.fixedCode, 'utf8');
              fixes.push({
                type: checkName,
                risks,
                applied: true,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } else if (type === "--performance") {
        const performanceFix = await this.getPerformanceFix(code, checks);
        if (performanceFix) {
          await fs.writeFile(filePath, performanceFix.fixedCode, 'utf8');
          fixes.push(performanceFix);
        }
      }

      if (fixes.length > 0) {
        console.log(`✅ Применено исправлений: ${fixes.length}`);
        this.fixes.push(...fixes);
      }

      return fixes;
    } catch (error) {
      console.error('Ошибка при применении исправлений:', error);
      return [];
    }
  }

  async getSecurityFix(code, checkName, risks) {
    // Генерируем промпт для получения исправления
    const prompt = [
      "Please provide a specific code fix for the following security issue:",
      `Issue type: ${checkName}`,
      `Risks identified: ${risks.join(", ")}`,
      "Original code:",
      "```javascript",
      code,
      "```",
      "Provide only the fixed code without explanations.",
    ].join("\n");

    const result = await this.chat.sendMessage(prompt);
    return {
      type: checkName,
      risks,
      fixedCode: result.response.text(),
    };
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
      ...checks.memoryUsage
    ].join("\n");

    try {
      const result = await this.chat.sendMessage(prompt);
      return {
        type: 'performance',
        issues: [...checks.complexity, ...checks.memoryUsage],
        fixedCode: result.response.text(),
        applied: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ошибка при получении оптимизаций:', error);
      return null;
    }
  }

  async formatCode(code) {
    const filePath = this.options.filePath;
    console.log(`\n🔧 Форматирование файла: ${filePath}`);
    const extension = path.extname(filePath);

    for (const [name, config] of Object.entries(FORMATTERS)) {
      try {
        if (config.extensions.includes(extension)) {
          console.log(`   Применяем ${name}...`);
          const command = `${config.command} ${config.args.join(" ")} "${filePath}"`;
          execSync(command, { stdio: "pipe" });
          console.log(`   ✅ ${name} completed`);
        }
      } catch (error) {
        console.warn(`⚠️  Форматтер ${name} failed:`, error.message);
      }
    }
  }
}

module.exports = CodeAnalyzer;
