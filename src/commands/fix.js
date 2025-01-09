import { runCodeChecks } from '../services/codeChecks.js';

export default async function fix() {
  await runCodeChecks({ fix: true });
}
