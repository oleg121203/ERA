import * as fs from 'fs';
import * as path from 'path';
import { watch } from 'chokidar';

interface FileStructure {
  name: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

class ProjectStructureGenerator {
  private ignoredPaths = [
    'node_modules',
    '.git',
    'dist',
    'out',
    '.vscode-test'
  ];

  constructor(private rootDir: string, private outputFile: string) {}

  async generateStructure(): Promise<void> {
    const structure = await this.scanDirectory(this.rootDir);
    await this.writeStructure(structure);
  }

  private async scanDirectory(dir: string): Promise<FileStructure[]> {
    const items = await fs.promises.readdir(dir, { withFileTypes: true });
    const structure: FileStructure[] = [];

    for (const item of items) {
      if (this.ignoredPaths.includes(item.name)) continue;

      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        structure.push({
          name: item.name,
          type: 'directory',
          children: await this.scanDirectory(fullPath)
        });
      } else {
        structure.push({
          name: item.name,
          type: 'file'
        });
      }
    }

    return structure;
  }

  private async writeStructure(structure: FileStructure[]): Promise<void> {
    const content = this.formatStructure(structure);
    await fs.promises.writeFile(this.outputFile, content);
  }

  private formatStructure(structure: FileStructure[], level = 0): string {
    let output = '';
    
    for (const item of structure) {
      const indent = '  '.repeat(level);
      const icon = item.type === 'directory' ? '📁' : '📄';
      
      output += `${indent}${icon} ${item.name}\n`;
      
      if (item.children) {
        output += this.formatStructure(item.children, level + 1);
      }
    }

    return output;
  }

  watch(): void {
    console.log('Watching for changes...');
    
    const watcher = watch(this.rootDir, {
      ignored: this.ignoredPaths,
      persistent: true
    });

    watcher.on('all', async (event: string, filePath: string) => {
      console.log(`Detected ${event} on ${filePath}`);
      await this.generateStructure();
    });
  }
}

// Точка входа
const [,, ...args] = process.argv;
const isWatch = args.includes('--watch');

const generator = new ProjectStructureGenerator(
  process.cwd(),
  path.join(process.cwd(), 'project-structure.txt')
);

if (isWatch) {
  generator.watch();
} else {
  generator.generateStructure()
    .then(() => console.log('Structure generated'))
    .catch(console.error);
}
