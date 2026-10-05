import { PREFECTURES } from '../constants/prefectures'
import { katakanaToHiragana } from './conversion'

function normalizeInput(answer: string): string {
  return katakanaToHiragana(answer.normalize('NFKC')).replace(/\s/g, '')
}

/** 正式名・略称・それぞれの読みを、共通データの短い読みに対応させる。 */
const prefectureReadings = new Map(
  PREFECTURES.flatMap(({ name, reading, shortName, shortReading }) =>
    [name, reading, shortName, shortReading].map(
      (answer) => [normalizeInput(answer), shortReading] as const,
    ),
  ),
)

/** 県名の表記が異なっても同じ県なら正解。誤った接尾辞は省略せず不正解にする。 */
export function checkPrefectureAnswer(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  const expected = prefectureReadings.get(normalizeInput(correctAnswer))
  return (
    expected !== undefined &&
    prefectureReadings.get(normalizeInput(userAnswer)) === expected
  )
}
