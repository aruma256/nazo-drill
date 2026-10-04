import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MAGIC_SQUARES,
  UNIQUE_CLUE_PATTERNS,
  generateMagicSquareQuestion,
  getNextNumber,
} from '../magicSquare'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('3×3魔方陣の出題', () => {
  it('完成形は異なる8通りで、1〜9を一度ずつ使い、全8方向の和が15になる', () => {
    expect(MAGIC_SQUARES).toHaveLength(8)
    expect(new Set(MAGIC_SQUARES.map((square) => square.join(''))).size).toBe(8)
    for (const square of MAGIC_SQUARES) {
      expect([...square].sort((a, b) => a - b)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9,
      ])
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ]
      for (const line of lines) {
        expect(line.reduce((sum, index) => sum + square[index], 0)).toBe(15)
      }
    }
  })

  it.each([
    ['two-clues', 2, 24],
    ['three-clues', 3, 80],
  ] as const)(
    '%sの全ヒント配置が、どの回転・反転でも完成形を一意に定める',
    (mode, count, patternCount) => {
      const patterns = UNIQUE_CLUE_PATTERNS[mode]
      expect(patterns).toHaveLength(patternCount)
      expect(new Set(patterns.map((pattern) => pattern.join(','))).size).toBe(
        patternCount,
      )
      for (const square of MAGIC_SQUARES) {
        for (const pattern of patterns) {
          expect(pattern).toHaveLength(count)
          const matching = MAGIC_SQUARES.filter((candidate) =>
            pattern.every((index) => candidate[index] === square[index]),
          )
          expect(matching).toEqual([square])
        }
      }
    },
  )

  it('1・2・3を見せる練習は、全8配置で4から始まり、完成形も一意になる', () => {
    const random = vi.spyOn(Math, 'random')
    for (let index = 0; index < MAGIC_SQUARES.length; index++) {
      random.mockReturnValue((index + 0.5) / MAGIC_SQUARES.length)
      const question = generateMagicSquareQuestion('first-three')
      expect(question.solution).toEqual(MAGIC_SQUARES[index])
      expect(question.cells.filter(Boolean).sort()).toEqual([1, 2, 3])
      expect(getNextNumber(question.cells)).toBe(4)
      expect(
        MAGIC_SQUARES.filter((candidate) =>
          question.cells.every(
            (number, cell) => number === 0 || number === candidate[cell],
          ),
        ),
      ).toEqual([question.solution])
    }
  })

  it.each(['first-three', 'two-clues', 'three-clues'] as const)(
    '%sでは前問の完成形を続けて出さず、正しい個数のヒントを見せる',
    (mode) => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const first = generateMagicSquareQuestion(mode)
      const second = generateMagicSquareQuestion(mode, first.answer)
      expect(second.answer).not.toBe(first.answer)
      expect(second.cells.filter(Boolean)).toHaveLength(
        mode === 'two-clues' ? 2 : 3,
      )
      expect(second.question).toBe(second.cells.join(''))
      expect(second.answer).toBe(second.solution.join(''))
      expect(
        MAGIC_SQUARES.filter((candidate) =>
          second.cells.every(
            (number, index) => number === 0 || candidate[index] === number,
          ),
        ),
      ).toHaveLength(1)
    },
  )

  it('見えている数字と置いた数字を飛ばし、9まで埋まったら完成になる', () => {
    expect(getNextNumber([0, 1, 6, 0, 5, 0, 0, 0, 2])).toBe(3)
    expect(getNextNumber([8, 1, 6, 3, 5, 7, 4, 0, 2])).toBe(9)
    expect(getNextNumber(MAGIC_SQUARES[0])).toBeNull()
  })
})
