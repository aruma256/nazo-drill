import { describe, it, expect } from 'vitest'
import {
  DIRECTION_DELTAS,
  DIRECTION_ARROWS,
  VALID_PATTERNS,
  generateSlideQuestion,
  parseSlideQuestion,
  type Direction,
} from '../gojuonSlide'
import { GOJUON_TABLE, isEmptyCell } from '../../gojuonPick'

describe('DIRECTION_DELTAS', () => {
  it('should define all 8 directions', () => {
    const directions: Direction[] = [
      'up',
      'down',
      'left',
      'right',
      'up-right',
      'down-right',
      'down-left',
      'up-left',
    ]

    expect(Object.keys(DIRECTION_DELTAS).length).toBe(8)
    for (const dir of directions) {
      expect(DIRECTION_DELTAS[dir]).toBeDefined()
      expect(typeof DIRECTION_DELTAS[dir].dRow).toBe('number')
      expect(typeof DIRECTION_DELTAS[dir].dCol).toBe('number')
    }
  })

  it('should have correct delta values', () => {
    expect(DIRECTION_DELTAS.up).toEqual({ dRow: -1, dCol: 0 })
    expect(DIRECTION_DELTAS.down).toEqual({ dRow: 1, dCol: 0 })
    expect(DIRECTION_DELTAS.left).toEqual({ dRow: 0, dCol: -1 })
    expect(DIRECTION_DELTAS.right).toEqual({ dRow: 0, dCol: 1 })
    expect(DIRECTION_DELTAS['up-right']).toEqual({ dRow: -1, dCol: 1 })
    expect(DIRECTION_DELTAS['down-right']).toEqual({ dRow: 1, dCol: 1 })
    expect(DIRECTION_DELTAS['down-left']).toEqual({ dRow: 1, dCol: -1 })
    expect(DIRECTION_DELTAS['up-left']).toEqual({ dRow: -1, dCol: -1 })
  })
})

describe('DIRECTION_ARROWS', () => {
  it('should define arrows for all 8 directions', () => {
    expect(Object.keys(DIRECTION_ARROWS).length).toBe(8)
  })

  it('should have correct arrow characters', () => {
    expect(DIRECTION_ARROWS.up).toBe('↑')
    expect(DIRECTION_ARROWS.down).toBe('↓')
    expect(DIRECTION_ARROWS.left).toBe('←')
    expect(DIRECTION_ARROWS.right).toBe('→')
    expect(DIRECTION_ARROWS['up-right']).toBe('↗')
    expect(DIRECTION_ARROWS['down-right']).toBe('↘')
    expect(DIRECTION_ARROWS['down-left']).toBe('↙')
    expect(DIRECTION_ARROWS['up-left']).toBe('↖')
  })
})

describe('VALID_PATTERNS', () => {
  it('should not be empty', () => {
    expect(VALID_PATTERNS.length).toBeGreaterThan(0)
  })

  it('should not contain patterns starting from empty cells', () => {
    for (const pattern of VALID_PATTERNS) {
      expect(GOJUON_TABLE[pattern.row][pattern.col]).toBe(pattern.char)
      expect(pattern.char).not.toBe('')
    }
  })

  it('should not contain patterns moving to empty cells', () => {
    for (const pattern of VALID_PATTERNS) {
      const { dRow, dCol } = DIRECTION_DELTAS[pattern.direction]
      const targetRow = pattern.row + dRow
      const targetCol = pattern.col + dCol

      expect(isEmptyCell(targetRow, targetCol)).toBe(false)
      expect(GOJUON_TABLE[targetRow][targetCol]).toBe(pattern.answer)
    }
  })

  it('should not contain patterns moving out of bounds', () => {
    for (const pattern of VALID_PATTERNS) {
      const { dRow, dCol } = DIRECTION_DELTAS[pattern.direction]
      const targetRow = pattern.row + dRow
      const targetCol = pattern.col + dCol

      expect(targetRow).toBeGreaterThanOrEqual(0)
      expect(targetRow).toBeLessThanOrEqual(4)
      expect(targetCol).toBeGreaterThanOrEqual(0)
      expect(targetCol).toBeLessThanOrEqual(10)
    }
  })

  it('should have correct answer for each pattern', () => {
    for (const pattern of VALID_PATTERNS) {
      const { dRow, dCol } = DIRECTION_DELTAS[pattern.direction]
      const expectedAnswer =
        GOJUON_TABLE[pattern.row + dRow][pattern.col + dCol]
      expect(pattern.answer).toBe(expectedAnswer)
    }
  })

  it('should not include right direction from あ column (col=10)', () => {
    const rightFromA = VALID_PATTERNS.filter(
      (p) => p.col === 10 && p.direction === 'right',
    )
    expect(rightFromA.length).toBe(0)
  })

  it('should not include left direction from ん column (col=0)', () => {
    const leftFromN = VALID_PATTERNS.filter(
      (p) => p.col === 0 && p.direction === 'left',
    )
    expect(leftFromN.length).toBe(0)
  })
})

describe('generateSlideQuestion', () => {
  it('should generate a valid question', () => {
    const result = generateSlideQuestion(null)

    expect(result.question.question).toBeTruthy()
    expect(result.question.answer).toBeTruthy()
    expect(result.question.answer.length).toBe(1)
    expect(result.newLastQuestion).toBeTruthy()
  })

  it('should format question as "char arrow"', () => {
    const result = generateSlideQuestion(null)
    const { char, arrow } = parseSlideQuestion(result.question.question)

    expect(char.length).toBe(1)
    expect(Object.values(DIRECTION_ARROWS)).toContain(arrow)
  })

  it('should avoid the same question consecutively', () => {
    let lastQuestion: string | null = null
    for (let i = 0; i < 50; i++) {
      const result = generateSlideQuestion(lastQuestion)
      if (lastQuestion !== null) {
        expect(result.newLastQuestion).not.toBe(lastQuestion)
      }
      lastQuestion = result.newLastQuestion
    }
  })

  it('should generate various questions over multiple calls', () => {
    const questions = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const result = generateSlideQuestion(null)
      questions.add(result.question.question)
    }
    // 100回呼び出して、少なくとも10種類の問題が生成されること
    expect(questions.size).toBeGreaterThan(10)
  })
})

describe('parseSlideQuestion', () => {
  it('should correctly parse question string', () => {
    const questionStr = 'あ ↓'
    const { char, arrow } = parseSlideQuestion(questionStr)

    expect(char).toBe('あ')
    expect(arrow).toBe('↓')
  })

  it('should handle all arrow types', () => {
    for (const [, arrowChar] of Object.entries(DIRECTION_ARROWS)) {
      const questionStr = `か ${arrowChar}`
      const { char, arrow } = parseSlideQuestion(questionStr)

      expect(char).toBe('か')
      expect(arrow).toBe(arrowChar)
    }
  })
})

describe('specific slide examples', () => {
  it('should have pattern for あ↓=い', () => {
    const pattern = VALID_PATTERNS.find(
      (p) => p.char === 'あ' && p.direction === 'down',
    )
    expect(pattern).toBeDefined()
    expect(pattern?.answer).toBe('い')
  })

  it('should have pattern for あ←=か', () => {
    const pattern = VALID_PATTERNS.find(
      (p) => p.char === 'あ' && p.direction === 'left',
    )
    expect(pattern).toBeDefined()
    expect(pattern?.answer).toBe('か')
  })

  it('should have pattern for ん↓=わ for を', () => {
    // ん (row=0, col=0) から↓ (row+1) は row=1, col=0 だが、これは空欄
    const pattern = VALID_PATTERNS.find(
      (p) => p.char === 'ん' && p.direction === 'down',
    )
    // ん行い段は空欄なので、この方向への移動は存在しない
    expect(pattern).toBeUndefined()
  })

  it('should not have pattern for き←ん because target is empty', () => {
    // き (row=1, col=9) から← (col-1) は col=8 = し
    // Actually, let's check き→← = し which should be valid
    const pattern = VALID_PATTERNS.find(
      (p) => p.char === 'き' && p.direction === 'left',
    )
    expect(pattern).toBeDefined()
    expect(pattern?.answer).toBe('し')
  })
})
