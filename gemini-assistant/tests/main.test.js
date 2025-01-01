const { jest } = require("@jest/globals");
const fs = require("fs").promises;
const path = require("path");

// FILE: gemini-assistant/test/main.test.js

// Mock dependencies
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

// Mock test fixtures
const mockCode = `
function add(a, b) {
    return a + b;
}
`;

const mockAnalysisResult = {
  response: {
    text: () => "Analysis completed successfully",
  },
};

describe("handleCodeAnalysis", () => {
  let mockChat;
  let mockPromptUser;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockChat = {
      sendMessage: jest.fn().mockResolvedValue(mockAnalysisResult),
    };

    mockPromptUser = jest.fn();
    global.promptUser = mockPromptUser;

    // Reset fs mocks
    fs.access.mockReset();
    fs.readFile.mockReset();
    fs.readdir.mockReset();
    fs.stat.mockReset();
  });

  test("handles manual code input correctly", async () => {
    // Setup mocks
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose basic analysis
      .mockResolvedValueOnce("1") // Choose manual input
      .mockResolvedValueOnce(mockCode) // Code input
      .mockResolvedValueOnce("y"); // Auto-fix option

    await handleCodeAnalysis(mockChat);

    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining(mockCode)
    );
    expect(mockChat.sendMessage).toHaveBeenCalledTimes(1);
  });

  test("handles file analysis correctly", async () => {
    // Setup mocks
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose basic analysis
      .mockResolvedValueOnce("2") // Choose file input
      .mockResolvedValueOnce("./test.js") // File path
      .mockResolvedValueOnce("y"); // Auto-fix option

    fs.access.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue(mockCode);

    await handleCodeAnalysis(mockChat);

    expect(fs.access).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining(mockCode)
    );
  });

  test("handles directory analysis correctly", async () => {
    // Setup mocks
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose basic analysis
      .mockResolvedValueOnce("3") // Choose directory input
      .mockResolvedValueOnce("./src") // Directory path
      .mockResolvedValueOnce("y") // Analyze all files
      .mockResolvedValueOnce("y"); // Auto-fix option

    fs.access.mockResolvedValue(undefined);
    fs.stat.mockResolvedValue({ isDirectory: () => true });
    fs.readdir.mockResolvedValue([
      { name: "test1.js", isDirectory: () => false },
      { name: "test2.js", isDirectory: () => false },
    ]);
    fs.readFile.mockResolvedValue(mockCode);

    await handleCodeAnalysis(mockChat);

    expect(fs.readdir).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining(mockCode)
    );
  });

  test("handles multiple files selection correctly", async () => {
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose basic analysis
      .mockResolvedValueOnce("4") // Choose multiple files
      .mockResolvedValueOnce("./file1.js,./file2.js") // File paths
      .mockResolvedValueOnce("y"); // Auto-fix option

    fs.access.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue(mockCode);

    await handleCodeAnalysis(mockChat);

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(mockChat.sendMessage).toHaveBeenCalledTimes(2);
  });

  test("handles errors gracefully", async () => {
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose basic analysis
      .mockResolvedValueOnce("2") // Choose file input
      .mockResolvedValueOnce("./nonexistent.js");

    fs.access.mockRejectedValue(new Error("ENOENT"));

    const consoleSpy = jest.spyOn(console, "error");

    await handleCodeAnalysis(mockChat);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Ошибка"));

    consoleSpy.mockRestore();
  });

  test("validates analysis type selection", async () => {
    mockPromptUser.mockResolvedValueOnce("10"); // Invalid analysis type

    await handleCodeAnalysis(mockChat);

    expect(mockChat.sendMessage).not.toHaveBeenCalled();
  });

  test("handles invalid file paths", async () => {
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose basic analysis
      .mockResolvedValueOnce("2") // Choose file input
      .mockResolvedValueOnce("../../../etc/passwd"); // Invalid path

    await handleCodeAnalysis(mockChat);

    expect(fs.access).not.toHaveBeenCalled();
    expect(mockChat.sendMessage).not.toHaveBeenCalled();
  });
});

// Add test helpers
function mockFileSystem(structure) {
  const mockFs = {
    files: new Map(),
    directories: new Set(),
  };

  function addEntry(path, content) {
    if (typeof content === "string") {
      mockFs.files.set(path, content);
    } else {
      mockFs.directories.add(path);
      Object.entries(content).forEach(([name, value]) => {
        addEntry(`${path}/${name}`, value);
      });
    }
  }

  Object.entries(structure).forEach(([path, content]) => {
    addEntry(path, content);
  });

  return mockFs;
}
const { jest } = require("@jest/globals");
const fs = require("fs").promises;
const path = require("path");

// FILE: gemini-assistant/src/main.test.js

// Mock dependencies
jest.mock("fs").promises;
jest.mock("readline");
jest.mock("@google/generative-ai");

describe("handleCodeAnalysis", () => {
  let mockChat;
  let mockPromptUser;

  beforeEach(() => {
    // Reset mocks before each test
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

  test("handles manual code input correctly", async () => {
    // Setup mocks
    mockPromptUser
      .mockResolvedValueOnce("1") // Choose analysis type (basic)
      .mockResolvedValueOnce("1") // Choose manual input
      .mockResolvedValueOnce("const x = 1;") // Code input
      .mockResolvedValueOnce("y"); // Auto-fix option

    await handleCodeAnalysis(mockChat);

    // Verify chat interaction
    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining("const x = 1;")
    );
  });

  test("handles file analysis correctly", async () => {
    // Setup mocks
    mockPromptUser
      .mockResolvedValueOnce("1") // Analysis type
      .mockResolvedValueOnce("2") // File input option
      .mockResolvedValueOnce("./test.js") // File path
      .mockResolvedValueOnce("y"); // Auto-fix option

    fs.access.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue("const y = 2;");

    await handleCodeAnalysis(mockChat);

    expect(fs.access).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining("const y = 2;")
    );
  });

  test("handles directory analysis correctly", async () => {
    // Setup mocks
    mockPromptUser
      .mockResolvedValueOnce("1") // Analysis type
      .mockResolvedValueOnce("3") // Directory option
      .mockResolvedValueOnce("./src") // Directory path
      .mockResolvedValueOnce("y") // Analyze all files
      .mockResolvedValueOnce("y"); // Auto-fix option

    fs.stat.mockResolvedValue({ isDirectory: () => true });
    fs.readdir.mockResolvedValue([
      { name: "test1.js", isDirectory: () => false },
      { name: "test2.js", isDirectory: () => false },
    ]);
    fs.readFile.mockResolvedValue("const z = 3;");

    await handleCodeAnalysis(mockChat);

    expect(fs.readdir).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(mockChat.sendMessage).toHaveBeenCalledWith(
      expect.stringContaining("const z = 3;")
    );
  });

  test("handles errors gracefully", async () => {
    // Setup mocks to trigger error
    mockPromptUser
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("2")
      .mockResolvedValueOnce("./nonexistent.js");

    fs.access.mockRejectedValue(new Error("ENOENT"));

    const consoleSpy = jest.spyOn(console, "error");

    await handleCodeAnalysis(mockChat);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Ошибка"));

    consoleSpy.mockRestore();
  });
});
