export interface AnalysisOptions {
    types: AnalysisType[];
    fix: number;
    autoApply: boolean;
    format: boolean;
    backup?: boolean;
}

export interface AnalysisType {
    name: string;
    confidence: number;
    impact: number;
    priority: number;
}

export interface AnalysisResult {
    type: string;
    analysis: string;
    confidence: number;
    impact: number;
    priority: number;
    appliedFixes: string[];
    specificChecks: Record<string, any>;
    formattingApplied: boolean;
    fixesApplied: number;
    error?: boolean;
}

export interface FileStructure {
    name: string;
    type: 'file' | 'directory';
    path: string;
    children?: FileStructure[];
}

export interface CodeFix {
    description: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning' | 'info' | 'suggestion';
    fix: string;
}

export interface AnalyzerConfig {
    apiKey: string;
    debug?: boolean;
    maxTokens?: number;
    baseUrl?: string;
}
