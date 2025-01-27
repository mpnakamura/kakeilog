export interface AnalysisResult {
  trends: string[];
  comparisons: {
    income: { current: number; previous: number; diff: number };
    expense: { current: number; previous: number; diff: number };
  };
  suggestions: string[];
}
