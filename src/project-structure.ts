import * as fs from 'fs';
import * as path from 'path';

interface FileStructure {
  name: string;
  type: 'file' | 'directory';
  children?: FileStructure[];
}

class ProjectStructureGenerator {
  constructor(private rootDir: string, private outputFile: string) {}

  async generateStructure(): Promise<void> {
    const structure = await this.readDir(this.rootDir);
    await fs.promises.writeFile(this.outputFile, JSON.stringify(structure, null, 2));
  }

  async readDir(dir: string): Promise<FileStructure> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const children = await Promise.all(
      dirents.map(async (dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory()
          ? this.readDir(res)
          : { name: dirent.name, type: 'file' };
      })
    );
    return { name: path.basename(dir), type: 'directory', children };
  }

  watch(): void {
    fs.watch(this.rootDir, { recursive: true }, async () => {
      await this.generateStructure();
    });
  }
}

// Точка входа
const [, , ...args] = process.argv;
const isWatch = args.includes('--watch');

const generator = new ProjectStructureGenerator(
  process.cwd(),
  path.join(process.cwd(), 'project-structure.txt')
);

if (isWatch) {
  generator.watch();
} else {
  generator
    .generateStructure()
    .then(() => console.log('Structure generated'))
    .catch(console.error);
}