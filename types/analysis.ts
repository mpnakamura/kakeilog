// アコーディオン用の提案の型
export interface Suggestion {
  title: string;
  content: string;
}

// 分析結果の型
export interface AnalysisResult {
  trends: string[];
  comparisons: {
    income: {
      current: number;
      previous: number;
      diff: number;
    };
    expense: {
      current: number;
      previous: number;
      diff: number;
    };
  };
  suggestions: Suggestion[]; // string[] から Suggestion[] に変更
}
