import type { Question } from '../../hooks/useDrill'
import { getRandomElementExcluding } from '../../utils'
import { checkPrefectureAnswer } from '../../utils/prefectureAnswer'
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

export function checkShapeAnswer(
  answer: string,
  prefecture: Prefecture,
): boolean {
  return checkPrefectureAnswer(answer, prefecture.name)
}
