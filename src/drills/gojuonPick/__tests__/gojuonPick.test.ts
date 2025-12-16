import { describe, it, expect } from 'vitest'
import {
  GOJUON_TABLE,
  EMPTY_CELLS,
  generateWordQuestion,
  generateSingleQuestion,
  generateTaMoQuestion,
  parseMarkedCells,
  isEmptyCell,
  type MarkedCell,
} from '../gojuonPick'
import { GOJUON_PICK_WORDS } from '../words'

describe('GOJUON_TABLE', () => {
  it('should have 5 rows and 11 columns', () => {
    expect(GOJUON_TABLE.length).toBe(5)
    for (const row of GOJUON_TABLE) {
      expect(row.length).toBe(11)
    }
  })

  it('should have あ at [0][10] (あ段あ列)', () => {
    expect(GOJUON_TABLE[0][10]).toBe('あ')
  })

  it('should have ん at [0][0] (ん)', () => {
    expect(GOJUON_TABLE[0][0]).toBe('ん')
  })

  it('should have empty string for yi (や行い段)', () => {
    expect(GOJUON_TABLE[1][3]).toBe('')
  })
})

describe('EMPTY_CELLS', () => {
  it('should contain 9 empty cells', () => {
    expect(EMPTY_CELLS.length).toBe(9)
  })

  it('should include yi position [1][3]', () => {
    expect(EMPTY_CELLS).toContainEqual([1, 3])
  })
})

describe('isEmptyCell', () => {
  it('should return true for empty cells', () => {
    expect(isEmptyCell(1, 0)).toBe(true) // ん行い段
    expect(isEmptyCell(1, 3)).toBe(true) // や行い段
    expect(isEmptyCell(4, 0)).toBe(true) // ん行お段
  })

  it('should return false for valid cells', () => {
    expect(isEmptyCell(0, 10)).toBe(false) // あ
    expect(isEmptyCell(2, 9)).toBe(false) // く
    expect(isEmptyCell(4, 1)).toBe(false) // を
  })
})

describe('generateWordQuestion', () => {
  it('should generate a question with marked cells', () => {
    const result = generateWordQuestion(null)

    expect(result.question.answer).toBeTruthy()
    expect(GOJUON_PICK_WORDS).toContain(result.question.answer)
    expect(result.newLastWord).toBe(result.question.answer)

    const markedCells = parseMarkedCells(result.question.question)
    expect(markedCells.length).toBe(result.question.answer.length)
  })

  it('should avoid the same word consecutively', () => {
    // 複数回試行して、前回と異なる単語が選ばれることを確認
    const results = new Set<string>()
    let lastWord: string | null = null

    for (let i = 0; i < 20; i++) {
      const result = generateWordQuestion(lastWord)
      if (lastWord !== null) {
        expect(result.question.answer).not.toBe(lastWord)
      }
      results.add(result.question.answer)
      lastWord = result.newLastWord
    }

    // 少なくとも2種類の単語が選ばれていること
    expect(results.size).toBeGreaterThan(1)
  })

  it('should assign correct numbers to marked cells', () => {
    const result = generateWordQuestion(null)
    const markedCells = parseMarkedCells(result.question.question)

    for (let i = 0; i < markedCells.length; i++) {
      expect(markedCells[i].number).toBe(i + 1)
    }
  })
})

describe('generateSingleQuestion', () => {
  it('should generate a single character question', () => {
    const result = generateSingleQuestion(null)

    expect(result.question.answer.length).toBe(1)
    expect(result.newLastCol).toBeGreaterThanOrEqual(0)
    expect(result.newLastCol).toBeLessThan(11)

    const markedCells = parseMarkedCells(result.question.question)
    expect(markedCells.length).toBe(1)
    expect(markedCells[0].number).toBe(1)
  })

  it('should avoid the same column consecutively', () => {
    let lastCol: number | null = null
    for (let i = 0; i < 20; i++) {
      const result = generateSingleQuestion(lastCol)
      if (lastCol !== null) {
        expect(result.newLastCol).not.toBe(lastCol)
      }
      lastCol = result.newLastCol
    }
  })
})

describe('generateTaMoQuestion', () => {
  it('should generate a question within ta-mo range (col 4-7)', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateTaMoQuestion(null)
      const markedCells = parseMarkedCells(result.question.question)

      expect(markedCells.length).toBe(1)
      expect(markedCells[0].col).toBeGreaterThanOrEqual(4)
      expect(markedCells[0].col).toBeLessThanOrEqual(7)
    }
  })

  it('should avoid the same column consecutively', () => {
    let lastCol: number | null = null
    for (let i = 0; i < 20; i++) {
      const result = generateTaMoQuestion(lastCol)
      if (lastCol !== null) {
        expect(result.newLastCol).not.toBe(lastCol)
      }
      lastCol = result.newLastCol
    }
  })
})

describe('parseMarkedCells', () => {
  it('should parse JSON string to MarkedCell array', () => {
    const cells: MarkedCell[] = [
      { row: 0, col: 10, number: 1 },
      { row: 1, col: 10, number: 2 },
    ]
    const jsonStr = JSON.stringify(cells)

    const parsed = parseMarkedCells(jsonStr)
    expect(parsed).toEqual(cells)
  })
})

describe('GOJUON_PICK_WORDS', () => {
  it('should contain only 3 or 4 character words', () => {
    for (const word of GOJUON_PICK_WORDS) {
      expect(word.length).toBeGreaterThanOrEqual(3)
      expect(word.length).toBeLessThanOrEqual(4)
    }
  })

  it('should not contain duplicate characters within a word', () => {
    for (const word of GOJUON_PICK_WORDS) {
      const chars = Array.from(word)
      const uniqueChars = new Set(chars)
      expect(uniqueChars.size).toBe(chars.length)
    }
  })

  it('should contain only valid hiragana from GOJUON_TABLE', () => {
    const validChars = new Set<string>()
    for (const row of GOJUON_TABLE) {
      for (const char of row) {
        if (char) validChars.add(char)
      }
    }

    for (const word of GOJUON_PICK_WORDS) {
      for (const char of word) {
        expect(validChars.has(char)).toBe(true)
      }
    }
  })
})
