/** 実力テストの結果。回答済みの問題だけを履歴に残す。 */
export interface ChallengeResultData {
  score: number
  history: HistoryEntry[]
}

/** 画面に必要なデータを、その画面の状態と一緒に保持する。 */
export type DrillPageState<Mode extends string> =
  | { screen: 'start' | 'countdown' | 'challenge' | 'note' }
  | { screen: 'drill'; mode: Mode }
  | { screen: 'challengeResult'; result: ChallengeResultData }

/** ドリルの問題オブジェクト。 */
export interface Question {
  /** 問題文 */
  question: string
  /** 正解 */
  answer: string
  /** 補助テキスト（例: "/26"） */
  subtext?: string
}

/** スコア統計。 */
export interface ScoreStats {
  /** 正答数 */
  score: number
  /** 出題数 */
  total: number
  /** 正答率（パーセント） */
  percentage: number
}

/** フィードバック情報。 */
export interface Feedback {
  type: 'correct' | 'retry'
}

/** 1回答分の履歴。練習の再回答も、それぞれ記録する。 */
export interface HistoryEntry {
  /** 一意の識別子 */
  id: number
  /** 問題オブジェクト */
  question: Question
  /** 正規化前のユーザーの回答 */
  userAnswer: string
  /** 正解かどうか */
  isCorrect: boolean
}

/** 問題生成関数の型。 */
export type QuestionGenerator = () => Question
