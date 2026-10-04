import {
  getRandomInt,
  getRandomElementExcluding,
  katakanaToHiragana,
} from '../../utils'
import type { Question } from '../../hooks/useDrill'
import { PREFECTURES as PREFECTURE_DATA } from '../../constants/prefectures'

/**
 * 47都道府県のリスト（ひらがな）
 */
export const PREFECTURES: readonly string[] = PREFECTURE_DATA.map(
  (prefecture) => prefecture.shortReading,
)

function getPrefecturesContaining(chars: string): Record<string, string[]> {
  return Object.fromEntries(
    Array.from(chars, (char) => [
      char,
      PREFECTURES.filter((prefecture) => prefecture.includes(char)),
    ]),
  )
}

/**
 * 1県確定の文字: その文字を含む都道府県は1つだけ
 * 「ざこほどのてにねずめろん」
 */
export const SINGLE_PREFECTURE_CHARS =
  getPrefecturesContaining('ざこほどのてにねずめろん')

/**
 * 2県確定の文字: その文字を含む都道府県は2つだけ
 * 「えっぐもばごりら」
 */
export const DOUBLE_PREFECTURE_CHARS =
  getPrefecturesContaining('えっぐもばごりら')

/**
 * 漢字→ひらがなのマッピング
 */
export const KANJI_TO_HIRAGANA: Record<string, string> = Object.fromEntries(
  PREFECTURE_DATA.map((prefecture) => [
    prefecture.shortName,
    prefecture.shortReading,
  ]),
)

/**
 * 文字列の指定位置を◯に置換
 */
export function replaceWithCircle(str: string, indices: number[]): string {
  const chars = str.split('')
  for (const idx of indices) {
    chars[idx] = '◯'
  }
  return chars.join('')
}

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 出題文字列が一意に正解を特定できるかチェック
 */
export function isUnique(questionStr: string, answer: string): boolean {
  const matches = PREFECTURES.filter((prefecture) => {
    if (prefecture.length !== questionStr.length) return false
    for (let i = 0; i < questionStr.length; i++) {
      if (questionStr[i] !== '◯' && questionStr[i] !== prefecture[i]) {
        return false
      }
    }
    return true
  })
  return matches.length === 1 && matches[0] === answer
}

/**
 * できるだけ多くの文字を◯に置換した出題文字列を生成
 */
export function generateQuestionString(prefecture: string): string | null {
  const indices: number[] = []
  const positions = shuffleArray(
    Array.from({ length: prefecture.length }, (_, i) => i),
  )

  for (const pos of positions) {
    const testIndices = [...indices, pos]
    const testStr = replaceWithCircle(prefecture, testIndices)
    if (isUnique(testStr, prefecture)) {
      indices.push(pos)
    }
  }

  // 少なくとも1文字は◯にする必要がある
  if (indices.length === 0) {
    return null
  }

  // 少なくとも1文字は見えている必要がある
  if (indices.length === prefecture.length) {
    indices.pop()
  }

  return replaceWithCircle(prefecture, indices)
}

/**
 * 回答を正規化する（漢字・カタカナをひらがなに変換）
 */
export function normalizeAnswer(answer: string): string {
  const trimmed = answer.trim()

  // 漢字の都道府県名をひらがなに変換
  if (KANJI_TO_HIRAGANA[trimmed]) {
    return KANJI_TO_HIRAGANA[trimmed]
  }

  // カタカナをひらがなに変換
  return katakanaToHiragana(trimmed)
}

/**
 * 2県確定モードの回答チェック（順序不問）
 */
export function checkTwoPrefecturesAnswer(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const normalized = normalizeAnswer(userAnswer)
  // スペース、カンマ、読点、全角スペース(\u3000)で分割
  const userParts = normalized
    .split(/[\s,、\u3000]+/)
    .filter((s) => s)
    .sort()
  const answerParts = correctAnswer.split(' ').sort()

  return (
    userParts.length === answerParts.length &&
    userParts.every((part, i) => part === answerParts[i])
  )
}

/**
 * 通常モードの問題を生成する
 */
export function generateNormalQuestion(lastPrefecture: string | null): {
  question: Question
  lastPrefecture: string
} {
  const maxRetries = 100

  for (let retry = 0; retry < maxRetries; retry++) {
    const prefecture = getRandomElementExcluding(PREFECTURES, lastPrefecture)
    const questionStr = generateQuestionString(prefecture)

    if (questionStr !== null) {
      return {
        question: {
          question: questionStr,
          answer: prefecture,
        },
        lastPrefecture: prefecture,
      }
    }
  }

  // フォールバック（通常は到達しない）
  return {
    question: {
      question: '◯うきょう',
      answer: 'とうきょう',
    },
    lastPrefecture: 'とうきょう',
  }
}

/**
 * 1県確定特訓モードの問題を生成する
 */
export function generateOnePrefectureQuestion(lastChar: string | null): {
  question: Question
  lastChar: string
} {
  const chars = Object.keys(SINGLE_PREFECTURE_CHARS)
  const char = getRandomElementExcluding(chars, lastChar)
  const prefectures = SINGLE_PREFECTURE_CHARS[char]

  return {
    question: {
      question: `「${char}」を含む`,
      answer: prefectures[0],
      subtext: '都道府県',
    },
    lastChar: char,
  }
}

/**
 * 2県確定特訓モードの問題を生成する
 */
export function generateTwoPrefecturesQuestion(lastChar: string | null): {
  question: Question
  lastChar: string
} {
  const chars = Object.keys(DOUBLE_PREFECTURE_CHARS)
  const char = getRandomElementExcluding(chars, lastChar)
  const prefectures = DOUBLE_PREFECTURE_CHARS[char]
  const answer = prefectures.toSorted().join(' ')

  return {
    question: {
      question: `「${char}」を含む`,
      answer,
      subtext: '都道府県',
    },
    lastChar: char,
  }
}
