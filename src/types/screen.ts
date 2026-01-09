/**
 * ドリルページの画面状態の型定義
 */

/**
 * 基本的なドリルページで使用される画面状態
 * (start, drill, countdown, challenge, challengeResult)
 */
export type DrillScreen =
  | 'start'
  | 'drill'
  | 'countdown'
  | 'challenge'
  | 'challengeResult'

/**
 * 補足説明画面付きドリルページで使用される画面状態
 * (start, drill, countdown, challenge, challengeResult, note)
 */
export type DrillScreenWithNote = DrillScreen | 'note'
