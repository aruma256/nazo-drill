import type { Question } from '../../hooks/useDrill'
import { getRandomElementExcluding, katakanaToHiragana } from '../../utils'
import { PREFECTURES, type Prefecture } from '../../constants/prefectures'

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
  const { name, reading, shortName, shortReading } = prefecture
  const accepted = [name, reading, shortName, shortReading]
  return accepted.some(
    (candidate) => normalize(candidate) === normalize(answer),
  )
}
