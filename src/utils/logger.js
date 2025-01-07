/* global console */
export default {
  info: (...args) => console.log("\x1b[36m%s\x1b[0m", ...args),
  error: (...args) => console.error("\x1b[31m%s\x1b[0m", ...args),
  success: (...args) => console.log("\x1b[32m%s\x1b[0m", ...args),
  warn: (...args) => console.warn("\x1b[33m%s\x1b[0m", ...args),
};
