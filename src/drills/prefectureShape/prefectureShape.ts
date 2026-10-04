import type { Question } from '../../hooks/useDrill'
import { getRandomElementExcluding, katakanaToHiragana } from '../../utils'
import { PREFECTURES, type Prefecture } from './prefectures'

export function generateShapeQuestion(
  previousId: number | null = null,
): Question {
  const prefecture = getRandomElementExcluding(
    PREFECTURES,
    previousId,
    (item) => item.id,
  )
  return {
    question: String(prefecture.id),
    answer: prefecture.name,
  }
}

function normalize(answer: string): string {
  return katakanaToHiragana(answer.normalize('NFKC')).replace(/\s/g, '')
}

export function checkShapeAnswer(
  answer: string,
  prefecture: Prefecture,
): boolean {
  const { name, reading } = prefecture
  // 北海道の「道」は名前の一部として残す。略称は正しい接尾辞だけを省略。
  const suffix =
    name === '北海道'
      ? ['', '']
      : name.endsWith('県')
        ? ['県', 'けん']
        : name.endsWith('府')
          ? ['府', 'ふ']
          : ['都', 'と']
  const shorten = (value: string, ending: string) =>
    ending ? value.slice(0, -ending.length) : value
  const accepted = [
    name,
    reading,
    shorten(name, suffix[0]),
    shorten(reading, suffix[1]),
  ]
  return accepted.some(
    (candidate) => normalize(candidate) === normalize(answer),
  )
}
