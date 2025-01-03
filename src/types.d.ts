// ...existing code...
export interface BreakpointAnalysisResult {
    type: string;
    analysis: string;
    confidence: number;
    impact: number;
    priority: number;
    breakpoints: Array<{
        stage: string;
        reason: string;
    }>;
}

export interface ImportsAnalysisResult {
    type: string;
    analysis: string;
    confidence: number;
    impact: number;
    priority: number;
    importDetails: Array<{
        importType: 'external' | 'internal';
        dependencies: string[];
        installed: boolean;
    }>;
}
// ...existing code...
