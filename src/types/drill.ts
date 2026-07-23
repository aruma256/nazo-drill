/**
 * ドリル画面の基本的な画面状態
 */
export type BaseScreen =
  'start' | 'drill' | 'countdown' | 'challenge' | 'challengeResult'

/**
 * 注釈画面を持つドリルの画面状態
 */
export type ScreenWithNote = BaseScreen | 'note'

/**
 * デフォルトの画面状態（noteなし）
 */
export type Screen = BaseScreen
