import { Request, Response } from 'express';
import { AnalysisService } from '../../services/analysis.service';
import { logger } from '../../utils/logger';
import { CodeAnalyzer } from '../../core/analyzer';
import { AnalysisOptions } from '../../core/types';
import { formatFile } from '../../utils/formatFile';

export class AnalysisController {
    private analysisService: AnalysisService;

    constructor() {
        this.analysisService = new AnalysisService();
    }

    async analyze(req: Request, res: Response): Promise<void> {
        try {
            const { files, options = {} } = req.body;

            if (!files || !Array.isArray(files) || files.length === 0) {
                throw new Error('No files provided for analysis');
            }

            const analysisOptions: AnalysisOptions = {
                fix: options.fix ?? DEFAULT_OPTIONS.fix,
                formatCode: options.format ?? DEFAULT_OPTIONS.formatCode,
                types: options.types ?? DEFAULT_OPTIONS.types,
                filePath: options.filePath
            };

            const analyzer = new CodeAnalyzer(analysisOptions);
            const results = [];

            for (const file of files) {
                let content = file.content;
                
                // Форматирование файла, если опция включена
                if (analysisOptions.formatCode) {
                    content = await formatFile(file.path, content);
                }

                const analysisResult = await analyzer.analyze(content);
                results.push({
                    file: file.path,
                    results: analysisResult
                });
            }

            res.json({ success: true, results });
        } catch (err) {
            const error = err as Error;
            logger.error('Analysis error:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async batchAnalyze(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.analysisService.batchAnalyze(req.body);
            res.json({ success: true, data: results });
        } catch (error) {
            logger.error('Batch analysis failed:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
}