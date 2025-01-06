import { AnalysisOptions } from '../core/types';
import { CodeAnalyzer } from '../core/analyzer';
import { formatFile } from '../utils/formatFile'; // Добавлено
import { logger } from '../utils/logger';

export class AnalysisService {
    private analyzer: CodeAnalyzer;

    constructor(options: AnalysisOptions) {
        this.analyzer = new CodeAnalyzer(options);
    }

    public async analyzeFiles(files: { path: string; content: string; }[]) {
        const results = [];

        for (const file of files) {
            let content = file.content;
            
            // Форматирование файла, если опция включена
            if (this.analyzer.options.formatCode) {
                content = await formatFile(file.path, content);
            }

            const analysisResult = await this.analyzer.analyze(content);
            results.push({
                file: file.path,
                results: analysisResult
            });
        }

        return results;
    }

    // Добавлен метод batchAnalyze
    public async batchAnalyze(data: any) {
        const { files, options } = data;
        const analysisOptions: AnalysisOptions = {
            fix: options.fix ?? DEFAULT_OPTIONS.fix,
            formatCode: options.format ?? DEFAULT_OPTIONS.formatCode,
            types: options.types ?? DEFAULT_OPTIONS.types,
            filePath: options.filePath
        };

        const analyzer = new CodeAnalyzer(analysisOptions);
        return await this.analyzeFiles(files);
    }
}