import type { Question } from '../../hooks/useDrill'
import { getRandomElement, getRandomElementExcluding } from '../../utils/random'

export type MagicSquareMode = 'first-three' | 'three-clues' | 'two-clues'

export interface MagicSquareQuestion extends Question {
  /** 左上から行順に並べた完成形。 */
  solution: readonly number[]
  /** 0は空欄。 */
  cells: readonly number[]
}

function rotate(square: readonly number[]): number[] {
  return [6, 3, 0, 7, 4, 1, 8, 5, 2].map((index) => square[index])
}

const base = [8, 1, 6, 3, 5, 7, 4, 9, 2]
const rotations = [base]
for (let i = 1; i < 4; i++) rotations.push(rotate(rotations[i - 1]))

/** 回転4通りと、それぞれの左右反転。 */
export const MAGIC_SQUARES: readonly (readonly number[])[] = [
  ...rotations,
  ...rotations.map((square) =>
    [2, 1, 0, 5, 4, 3, 8, 7, 6].map((index) => square[index]),
  ),
]

const indices = Array.from({ length: 9 }, (_, index) => index)
const pairs = indices.flatMap((first) =>
  indices.filter((second) => second > first).map((second) => [first, second]),
)

function determinesOrientation(clues: readonly number[]): boolean {
  // 中央以外の、中心を挟んで対向していない2マスがあれば一意。
  return clues.some(
    (first) =>
      first !== 4 &&
      clues.some(
        (second) => second !== 4 && second !== first && first + second !== 8,
      ),
  )
}

export const UNIQUE_CLUE_PATTERNS = {
  'two-clues': pairs.filter(determinesOrientation),
  'three-clues': pairs
    .flatMap(([first, second]) =>
      indices
        .filter((third) => third > second)
        .map((third) => [first, second, third]),
    )
    .filter(determinesOrientation),
} as const

export function generateMagicSquareQuestion(
  mode: MagicSquareMode,
  previousAnswer: string | null = null,
): MagicSquareQuestion {
  // 見せるマスが違っても、同じ完成形を続けて出題しない。
  const solution = getRandomElementExcluding(
    MAGIC_SQUARES,
    previousAnswer,
    (square) => square.join(''),
  )
  const clues =
    mode === 'first-three'
      ? indices.filter((index) => solution[index] <= 3)
      : getRandomElement(UNIQUE_CLUE_PATTERNS[mode])
  const cells = solution.map((number, index) =>
    clues.includes(index) ? number : 0,
  )
  return {
    question: cells.join(''),
    answer: solution.join(''),
    solution,
    cells,
  }
}

/** 最初から見えている数字と、置いた数字を飛ばす。完成時はnull。 */
export function getNextNumber(cells: readonly number[]): number | null {
  for (let number = 1; number <= 9; number++) {
    if (!cells.includes(number)) return number
  }
  return null
}
