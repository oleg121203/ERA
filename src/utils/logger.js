/* global console */
const colors = {
  info: '\x1b[36m', // Cyan
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  success: '\x1b[32m', // Green
  reset: '\x1b[0m', // Reset
};

export default {
  info: (message, ...args) =>
    console.log(`${colors.info}[INFO] ${message}${colors.reset}`, ...args),
  error: (message, ...args) =>
    console.error(`${colors.error}[ERROR] ${message}${colors.reset}`, ...args),
  warn: (message, ...args) =>
    console.warn(`${colors.warn}[WARN] ${message}${colors.reset}`, ...args),
  success: (message, ...args) =>
    console.log(`${colors.success}[SUCCESS] ${message}${colors.reset}`, ...args),
};
