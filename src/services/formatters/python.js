import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export function formatPython(content) {
  const tempFilePath = join(tmpdir(), 'temp.py');
  writeFileSync(tempFilePath, content);

  try {
    // Используем black для форматирования
    execSync(`black ${tempFilePath}`);
    // Используем isort для сортировки импортов
    execSync(`isort ${tempFilePath}`);
    const formattedContent = readFileSync(tempFilePath, 'utf8');
    return formattedContent;
  } catch (error) {
    console.error('Ошибка форматирования Python файла:', error.message);
    return content;
  } finally {
    unlinkSync(tempFilePath);
  }
}
