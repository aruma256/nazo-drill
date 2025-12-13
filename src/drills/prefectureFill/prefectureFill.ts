import { getRandomInt, getRandomElementExcluding } from '../../utils'
import type { Question } from '../../hooks/useDrill'

/**
 * 47都道府県のリスト（ひらがな）
 */
export const PREFECTURES = [
  'ほっかいどう',
  'あおもり',
  'いわて',
  'みやぎ',
  'あきた',
  'やまがた',
  'ふくしま',
  'いばらき',
  'とちぎ',
  'ぐんま',
  'さいたま',
  'ちば',
  'とうきょう',
  'かながわ',
  'にいがた',
  'とやま',
  'いしかわ',
  'ふくい',
  'やまなし',
  'ながの',
  'ぎふ',
  'しずおか',
  'あいち',
  'みえ',
  'しが',
  'きょうと',
  'おおさか',
  'ひょうご',
  'なら',
  'わかやま',
  'とっとり',
  'しまね',
  'おかやま',
  'ひろしま',
  'やまぐち',
  'とくしま',
  'かがわ',
  'えひめ',
  'こうち',
  'ふくおか',
  'さが',
  'ながさき',
  'くまもと',
  'おおいた',
  'みやざき',
  'かごしま',
  'おきなわ',
] as const

/**
 * 1県確定の文字: その文字を含む都道府県は1つだけ
 * 「ざこほどのてにねずめろん」
 */
export const SINGLE_PREFECTURE_CHARS: Record<string, string[]> = {
  ざ: ['みやざき'], // 宮崎
  こ: ['こうち'], // 高知
  ほ: ['ほっかいどう'], // 北海道
  ど: ['ほっかいどう'], // 北海道
  の: ['ながの'], // 長野
  て: ['いわて'], // 岩手
  に: ['にいがた'], // 新潟
  ね: ['しまね'], // 島根
  ず: ['しずおか'], // 静岡
  め: ['えひめ'], // 愛媛
  ろ: ['ひろしま'], // 広島
  ん: ['ぐんま'], // 群馬
}

/**
 * 2県確定の文字: その文字を含む都道府県は2つだけ
 * 「えっぐもばごりら」
 */
export const DOUBLE_PREFECTURE_CHARS: Record<string, string[]> = {
  え: ['みえ', 'えひめ'], // 三重、愛媛
  っ: ['ほっかいどう', 'とっとり'], // 北海道、鳥取
  ぐ: ['ぐんま', 'やまぐち'], // 群馬、山口
  も: ['あおもり', 'くまもと'], // 青森、熊本
  ば: ['いばらき', 'ちば'], // 茨城、千葉
  ご: ['ひょうご', 'かごしま'], // 兵庫、鹿児島
  り: ['あおもり', 'とっとり'], // 青森、鳥取
  ら: ['いばらき', 'なら'], // 茨城、奈良
}

/**
 * 漢字→ひらがなのマッピング
 */
export const KANJI_TO_HIRAGANA: Record<string, string> = {
  北海道: 'ほっかいどう',
  青森: 'あおもり',
  岩手: 'いわて',
  宮城: 'みやぎ',
  秋田: 'あきた',
  山形: 'やまがた',
  福島: 'ふくしま',
  茨城: 'いばらき',
  栃木: 'とちぎ',
  群馬: 'ぐんま',
  埼玉: 'さいたま',
  千葉: 'ちば',
  東京: 'とうきょう',
  神奈川: 'かながわ',
  新潟: 'にいがた',
  富山: 'とやま',
  石川: 'いしかわ',
  福井: 'ふくい',
  山梨: 'やまなし',
  長野: 'ながの',
  岐阜: 'ぎふ',
  静岡: 'しずおか',
  愛知: 'あいち',
  三重: 'みえ',
  滋賀: 'しが',
  京都: 'きょうと',
  大阪: 'おおさか',
  兵庫: 'ひょうご',
  奈良: 'なら',
  和歌山: 'わかやま',
  鳥取: 'とっとり',
  島根: 'しまね',
  岡山: 'おかやま',
  広島: 'ひろしま',
  山口: 'やまぐち',
  徳島: 'とくしま',
  香川: 'かがわ',
  愛媛: 'えひめ',
  高知: 'こうち',
  福岡: 'ふくおか',
  佐賀: 'さが',
  長崎: 'ながさき',
  熊本: 'くまもと',
  大分: 'おおいた',
  宮崎: 'みやざき',
  鹿児島: 'かごしま',
  沖縄: 'おきなわ',
}

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
 * カタカナをひらがなに変換
 */
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60)
  })
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
  const answer = [...prefectures].sort().join(' ')

  return {
    question: {
      question: `「${char}」を含む`,
      answer,
      subtext: '都道府県',
    },
    lastChar: char,
  }
}
