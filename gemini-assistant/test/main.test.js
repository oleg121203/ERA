const { jest } = require("@jest/globals");
const fs = require("fs").promises;
const path = require("path");

// Мок зависимостей
jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
  },
}));

jest.mock("readline", () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock("@google/generative-ai");

// Мок logger
jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  success: jest.fn(),
  progress: jest.fn(),
}));

// Импорт фикстур
const { sampleCode } = require("./fixtures/sample-code");

describe("Code Analysis Tests", () => {
  let mockChat;
  let mockPromptUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChat = {
      sendMessage: jest.fn().mockResolvedValue({
        response: { text: () => "Analysis result" },
      }),
    };

    mockPromptUser = jest.fn();
    global.promptUser = mockPromptUser;

    // Reset fs mocks
    fs.access.mockReset();
    fs.readFile.mockReset();
    fs.readdir.mockReset();
    fs.stat.mockReset();
  });

  describe("Basic Analysis", () => {
    test("handles manual code input", async () => {
      mockPromptUser
        .mockResolvedValueOnce("1") // basic analysis
        .mockResolvedValueOnce("1") // manual input
        .mockResolvedValueOnce(sampleCode)
        .mockResolvedValueOnce("n"); // no autofix

      await handleCodeAnalysis(mockChat);
      expect(mockChat.sendMessage).toHaveBeenCalledWith(
        expect.stringContaining(sampleCode)
      );
    });

    test("handles file analysis", async () => {
      mockPromptUser
        .mockResolvedValueOnce("1")
        .mockResolvedValueOnce("2")
        .mockResolvedValueOnce("./test.js")
        .mockResolvedValueOnce("n");

      fs.access.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(sampleCode);

      await handleCodeAnalysis(mockChat);
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe("Directory Analysis", () => {
    test("handles recursive directory scan", async () => {
      mockPromptUser
        .mockResolvedValueOnce("1")
        .mockResolvedValueOnce("3")
        .mockResolvedValueOnce("./src")
        .mockResolvedValueOnce("y")
        .mockResolvedValueOnce("n");

      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.readdir.mockResolvedValue([
        { name: "test1.js", isDirectory: () => false },
        { name: "test2.js", isDirectory: () => false },
      ]);
      fs.readFile.mockResolvedValue(sampleCode);

      await handleCodeAnalysis(mockChat);
      expect(fs.readdir).toHaveBeenCalled();
    });

    test("handles multiple file selection", async () => {
      mockPromptUser
        .mockResolvedValueOnce("1")
        .mockResolvedValueOnce("4")
        .mockResolvedValueOnce("file1.js,file2.js")
        .mockResolvedValueOnce("n");

      fs.readFile.mockResolvedValue(sampleCode);

      await handleCodeAnalysis(mockChat);
      expect(fs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe("Batch Analysis", () => {
    test("parses analysis arguments correctly", () => {
      const input = "./src/**/*.js --basic --perf";
      const { paths, checks } = parseAnalysisArgs(input);

      expect(paths).toContain("./src/**/*.js");
      expect(checks).toContain("basic");
      expect(checks).toContain("perf");
    });

    test("handles batch file processing", async () => {
      mockPromptUser.mockResolvedValueOnce("./src --all");

      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.readdir.mockResolvedValue([
        { name: "test1.js", isDirectory: () => false },
      ]);
      fs.readFile.mockResolvedValue(sampleCode);

      await handleBatchAnalysis(mockChat);
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    test("handles file not found", async () => {
      mockPromptUser
        .mockResolvedValueOnce("1")
        .mockResolvedValueOnce("2")
        .mockResolvedValueOnce("./nonexistent.js");

      fs.access.mockRejectedValue(new Error("ENOENT"));

      const consoleSpy = jest.spyOn(console, "error");
      await handleCodeAnalysis(mockChat);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Ошибка")
      );
      consoleSpy.mockRestore();
    });

    test("validates paths", () => {
      expect(() => validatePath("../invalid")).toThrow();
      expect(validatePath("./valid")).toBe("./valid");
    });
  });
});
