import { runCodeChecks } from '../services/codeChecks.js';

export default async function validate(options) {
  await runCodeChecks(options);
}
