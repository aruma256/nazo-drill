import { getRandomElementExcluding } from '../../utils'
import type { Question } from '../../hooks/useDrill'
import { GOJUON_TABLE, isEmptyCell } from '../gojuonPick'

/**
 * 8方向の定義
 */
export type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-right'
  | 'down-right'
  | 'down-left'
  | 'up-left'

/**
 * 方向ごとの移動量
 */
export const DIRECTION_DELTAS: Record<
  Direction,
  { dRow: number; dCol: number }
> = {
  up: { dRow: -1, dCol: 0 },
  down: { dRow: 1, dCol: 0 },
  left: { dRow: 0, dCol: -1 },
  right: { dRow: 0, dCol: 1 },
  'up-right': { dRow: -1, dCol: 1 },
  'down-right': { dRow: 1, dCol: 1 },
  'down-left': { dRow: 1, dCol: -1 },
  'up-left': { dRow: -1, dCol: -1 },
}

/**
 * 方向に対応する矢印文字
 */
export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  'up-right': '↗',
  'down-right': '↘',
  'down-left': '↙',
  'up-left': '↖',
}

/**
 * 有効なスライドパターン
 */
interface SlidePattern {
  char: string
  row: number
  col: number
  direction: Direction
  answer: string
}

/**
 * ドリルのモード
 */
export type GojuonSlideMode = 'practice' | 'challenge'

/**
 * 指定位置から指定方向への移動が有効かどうかを判定
 */
function isValidMove(row: number, col: number, direction: Direction): boolean {
  const { dRow, dCol } = DIRECTION_DELTAS[direction]
  const newRow = row + dRow
  const newCol = col + dCol

  // 範囲チェック (5行 x 11列)
  if (newRow < 0 || newRow > 4 || newCol < 0 || newCol > 10) {
    return false
  }

  // 空欄チェック
  if (isEmptyCell(newRow, newCol)) {
    return false
  }

  return true
}

/**
 * すべての有効なスライドパターンを生成
 */
function generateAllValidPatterns(): SlidePattern[] {
  const patterns: SlidePattern[] = []
  const directions = Object.keys(DIRECTION_DELTAS) as Direction[]

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 11; col++) {
      const char = GOJUON_TABLE[row][col]
      if (!char) continue // 空欄セルはスキップ

      for (const direction of directions) {
        if (isValidMove(row, col, direction)) {
          const { dRow, dCol } = DIRECTION_DELTAS[direction]
          const answer = GOJUON_TABLE[row + dRow][col + dCol]
          patterns.push({ char, row, col, direction, answer })
        }
      }
    }
  }

  return patterns
}

/**
 * 有効なすべてのスライドパターン（事前計算）
 */
export const VALID_PATTERNS = generateAllValidPatterns()

/**
 * スライド問題を生成
 */
export function generateSlideQuestion(lastQuestion: string | null): {
  question: Question
  newLastQuestion: string
} {
  const pattern = getRandomElementExcluding(
    VALID_PATTERNS,
    lastQuestion,
    (p) => `${p.char}${p.direction}`,
  )

  const arrow = DIRECTION_ARROWS[pattern.direction]
  const questionText = `${pattern.char} ${arrow}`

  return {
    question: {
      question: questionText,
      answer: pattern.answer,
    },
    newLastQuestion: `${pattern.char}${pattern.direction}`,
  }
}

/**
 * 問題文字列から文字と矢印をパース
 */
export function parseSlideQuestion(questionStr: string): {
  char: string
  arrow: string
} {
  const [char, arrow] = questionStr.split(' ')
  return { char, arrow }
}
