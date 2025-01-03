const ANALYSIS_TYPES = {
  "--basic": {
    name: "Basic Analysis",
    desc: "Basic syntax and style checking",
    depth: "basic",
    metrics: {
      confidence: { CERTAIN: 90, LIKELY: 75, POSSIBLE: 60 },
      impact: { CRITICAL: 80, HIGH: 70, MEDIUM: 50 },
      priority: { IMMEDIATE: 85, HIGH: 70, MEDIUM: 50 },
    },
    formatters: ["prettier-vscode", "eslint"],
  },
  "--deep": {
    name: "Deep Analysis",
    desc: "Advanced code analysis and patterns",
    depth: "deep",
    metrics: {
      confidence: { CERTAIN: 95, LIKELY: 85, POSSIBLE: 70 },
      impact: { CRITICAL: 90, HIGH: 80, MEDIUM: 60 },
      priority: { IMMEDIATE: 90, HIGH: 80, MEDIUM: 60 },
    },
    formatters: ["prettier-vscode", "eslint", "typescript"],
  },
  "--security": {
    name: "Security Analysis",
    desc: "Security vulnerabilities check",
    requiresBase: true,
    metrics: {
      confidence: { CERTAIN: 95, LIKELY: 85, POSSIBLE: 70 },
      impact: { CRITICAL: 90, HIGH: 80, MEDIUM: 60 },
      priority: { IMMEDIATE: 90, HIGH: 80, MEDIUM: 60 },
    },
  },
  "--performance": {
    name: "Performance Analysis",
    desc: "Performance optimization check",
    requiresBase: true,
    metrics: {
      confidence: { CERTAIN: 90, LIKELY: 80, POSSIBLE: 65 },
      impact: { CRITICAL: 85, HIGH: 75, MEDIUM: 55 },
      priority: { IMMEDIATE: 85, HIGH: 75, MEDIUM: 55 },
    },
  },
  "--complexity": {
    name: "Complexity Analysis",
    desc: "Code complexity and maintainability",
    requiresBase: true,
    metrics: {
      confidence: { CERTAIN: 85, LIKELY: 75, POSSIBLE: 65 },
      impact: { CRITICAL: 80, HIGH: 70, MEDIUM: 60 },
      priority: { IMMEDIATE: 80, HIGH: 70, MEDIUM: 60 },
    },
  },
  "--structure": {
    name: "Code Structure Analysis",
    desc: "Code organization and architecture",
    requiresBase: true,
    metrics: {
      confidence: { CERTAIN: 85, LIKELY: 75, POSSIBLE: 65 },
      impact: { CRITICAL: 80, HIGH: 70, MEDIUM: 60 },
      priority: { IMMEDIATE: 80, HIGH: 70, MEDIUM: 60 },
    },
  },
  "--syntax": {
    name: "Syntax Analysis",
    desc: "Code syntax and style checking",
    depth: "basic",
    metrics: {
      confidence: { CERTAIN: 95, LIKELY: 85, POSSIBLE: 70 },
      impact: { CRITICAL: 60, HIGH: 50, MEDIUM: 40 },
      priority: { IMMEDIATE: 70, HIGH: 60, MEDIUM: 50 },
    },
    formatters: ["prettier-vscode", "eslint"],
  },
  '--syntax': {
    name: 'Syntax Analysis',
    desc: 'Code syntax and style checking',
    depth: 'basic',
    metrics: {
        confidence: {
            LOW: 60,
            MEDIUM: 80,
            CERTAIN: 95
        },
        impact: {
            LOW: 30,
            MEDIUM: 60,
            HIGH: 90
        },
        priority: {
            LOW: 40,
            MEDIUM: 70,
            HIGH: 90
        }
    },
    formatters: ['prettier', 'eslint']
  }
};

const FORMATTERS = {
  "prettier-vscode": {
    command: "prettier",
    args: ["--write"],
    extensions: [".js", ".ts", ".jsx", ".tsx"],
  },
  eslint: {
    command: "eslint",
    args: ["--fix"],
    extensions: [".js", ".ts"],
  },
  typescript: {
    command: "tsc",
    args: ["--noEmit"],
    extensions: [".ts", ".tsx"],
  },
};

module.exports = { ANALYSIS_TYPES, FORMATTERS };
