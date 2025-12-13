import { getRandomElementExcluding } from '../../utils'
import type { Question } from '../../hooks/useDrill'
import { GOJUON_PICK_WORDS } from './words'

/**
 * マークされたセルの位置と番号
 */
export interface MarkedCell {
  row: number
  col: number
  number: number
}

/**
 * 文字の位置情報
 */
interface CharPosition {
  row: number
  col: number
}

/**
 * 五十音表の定義（横向き：行=あいうえお、列=あかさたな...わ）
 * 右端があいうえお、左端がん
 * 行: あ列, い列, う列, え列, お列
 * 列: ん, わ段, ら段, や段, ま段, は段, な段, た段, さ段, か段, あ段（右から左）
 */
export const GOJUON_TABLE = [
  ['ん', 'わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'],
  ['', '', 'り', '', 'み', 'ひ', 'に', 'ち', 'し', 'き', 'い'],
  ['', '', 'る', 'ゆ', 'む', 'ふ', 'ぬ', 'つ', 'す', 'く', 'う'],
  ['', '', 'れ', '', 'め', 'へ', 'ね', 'て', 'せ', 'け', 'え'],
  ['', 'を', 'ろ', 'よ', 'も', 'ほ', 'の', 'と', 'そ', 'こ', 'お'],
] as const

/**
 * 空欄セルの位置一覧（yi, ye, wu, wi, we は五十音表に存在しない）
 */
export const EMPTY_CELLS: readonly [number, number][] = [
  [1, 0], // ん行い段
  [1, 1], // わ行い段
  [1, 3], // や行い段
  [2, 0], // ん行う段
  [2, 1], // わ行う段
  [3, 0], // ん行え段
  [3, 1], // わ行え段
  [3, 3], // や行え段
  [4, 0], // ん行お段
]

/**
 * 文字から位置へのマッピングを作成
 */
function createCharToPositionMap(): Map<string, CharPosition> {
  const map = new Map<string, CharPosition>()
  for (let row = 0; row < GOJUON_TABLE.length; row++) {
    for (let col = 0; col < GOJUON_TABLE[row].length; col++) {
      const char = GOJUON_TABLE[row][col]
      if (char) {
        map.set(char, { row, col })
      }
    }
  }
  return map
}

const charToPosition = createCharToPositionMap()

/**
 * 有効な文字のリストを取得
 */
function getValidChars(): string[] {
  const chars: string[] = []
  for (const row of GOJUON_TABLE) {
    for (const char of row) {
      if (char) {
        chars.push(char)
      }
    }
  }
  return chars
}

/**
 * 「た」～「も」の文字リストを取得（col 4～7: た、な、は、ま行）
 */
function getTaMoChars(): string[] {
  const chars: string[] = []
  for (let row = 0; row < GOJUON_TABLE.length; row++) {
    for (let col = 4; col <= 7; col++) {
      const char = GOJUON_TABLE[row][col]
      if (char) {
        chars.push(char)
      }
    }
  }
  return chars
}

const validChars = getValidChars()
const taMoChars = getTaMoChars()

/**
 * ドリルのモード
 */
export type DrillMode = 'word' | 'single' | 'ta-mo'

/**
 * 1文字モードの問題を生成（共通処理）
 */
function generateSingleCharQuestionFromList(
  charList: readonly string[],
  lastCol: number | null,
): { question: Question; newLastCol: number } {
  const char = getRandomElementExcluding(
    charList,
    lastCol,
    (c) => charToPosition.get(c)!.col,
  )
  const position = charToPosition.get(char)!
  const markedCells: MarkedCell[] = [
    {
      row: position.row,
      col: position.col,
      number: 1,
    },
  ]

  return {
    question: {
      question: JSON.stringify(markedCells),
      answer: char,
    },
    newLastCol: position.col,
  }
}

/**
 * 単語モードの問題を生成
 */
export function generateWordQuestion(lastWord: string | null): {
  question: Question
  newLastWord: string
} {
  const word = getRandomElementExcluding(GOJUON_PICK_WORDS, lastWord)

  const markedCells: MarkedCell[] = []
  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const position = charToPosition.get(char)
    if (position) {
      markedCells.push({
        row: position.row,
        col: position.col,
        number: i + 1,
      })
    }
  }

  return {
    question: {
      question: JSON.stringify(markedCells),
      answer: word,
    },
    newLastWord: word,
  }
}

/**
 * 1文字モードの問題を生成
 */
export function generateSingleQuestion(lastCol: number | null): {
  question: Question
  newLastCol: number
} {
  return generateSingleCharQuestionFromList(validChars, lastCol)
}

/**
 * 「た」～「も」特訓モードの問題を生成
 */
export function generateTaMoQuestion(lastCol: number | null): {
  question: Question
  newLastCol: number
} {
  return generateSingleCharQuestionFromList(taMoChars, lastCol)
}

/**
 * question文字列からMarkedCell配列をパース
 */
export function parseMarkedCells(questionStr: string): MarkedCell[] {
  return JSON.parse(questionStr) as MarkedCell[]
}

/**
 * セルが空欄かどうかを判定
 */
export function isEmptyCell(row: number, col: number): boolean {
  return EMPTY_CELLS.some(([r, c]) => r === row && c === col)
}
