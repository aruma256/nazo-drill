import { describe, it, expect } from 'vitest'
import {
  generateEjotyQuestion,
  generateSingleQuestion,
  generateWordQuestion,
  EJOTY_NUMBERS,
} from '../numberToAlpha'
import { NUMBER_TO_ALPHA_WORDS } from '../words'

describe('generateEjotyQuestion', () => {
  it('should generate a question with EJOTY numbers only (5, 10, 15, 20, 25)', () => {
    const { question, newLastNumber } = generateEjotyQuestion(null)

    expect(EJOTY_NUMBERS).toContain(newLastNumber)
    expect(question.question).toBe(newLastNumber.toString())
    expect(question.subtext).toBe('/26')
  })

  it('should return correct answer for EJOTY numbers', () => {
    // Test all EJOTY numbers
    const ejotyAnswers: Record<number, string> = {
      5: 'E',
      10: 'J',
      15: 'O',
      20: 'T',
      25: 'Y',
    }

    // Generate many questions to verify answers
    for (let i = 0; i < 50; i++) {
      const { question, newLastNumber } = generateEjotyQuestion(null)
      expect(question.answer).toBe(ejotyAnswers[newLastNumber])
    }
  })

  it('should avoid repeating the same number consecutively', () => {
    // Generate many questions and track consecutive repeats
    let lastNumber: number | null = null
    let hasNoRepeat = true

    for (let i = 0; i < 100; i++) {
      const { newLastNumber } = generateEjotyQuestion(lastNumber)
      if (lastNumber !== null && newLastNumber === lastNumber) {
        hasNoRepeat = false
        break
      }
      lastNumber = newLastNumber
    }

    expect(hasNoRepeat).toBe(true)
  })
})

describe('generateSingleQuestion', () => {
  it('should generate a question with numbers from 1 to 26', () => {
    const { question, newLastNumber } = generateSingleQuestion(null)

    expect(newLastNumber).toBeGreaterThanOrEqual(1)
    expect(newLastNumber).toBeLessThanOrEqual(26)
    expect(question.question).toBe(newLastNumber.toString())
    expect(question.subtext).toBe('/26')
  })

  it('should return correct answer for any number', () => {
    // Test several questions
    for (let i = 0; i < 50; i++) {
      const { question, newLastNumber } = generateSingleQuestion(null)
      const expectedAnswer = String.fromCharCode(64 + newLastNumber) // A=65, so 64+1=A
      expect(question.answer).toBe(expectedAnswer)
    }
  })

  it('should avoid repeating the same number consecutively', () => {
    let lastNumber: number | null = null
    let hasNoRepeat = true

    for (let i = 0; i < 100; i++) {
      const { newLastNumber } = generateSingleQuestion(lastNumber)
      if (lastNumber !== null && newLastNumber === lastNumber) {
        hasNoRepeat = false
        break
      }
      lastNumber = newLastNumber
    }

    expect(hasNoRepeat).toBe(true)
  })
})

describe('generateWordQuestion', () => {
  it('should generate a question with comma-separated numbers', () => {
    const { question, newLastWord } = generateWordQuestion(null)

    // Question should contain numbers separated by ", "
    const numbers = question.question.split(', ')
    expect(numbers.length).toBe(newLastWord.length)

    // Each number should be between 1 and 26
    for (const numStr of numbers) {
      const num = parseInt(numStr, 10)
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(26)
    }

    expect(question.subtext).toBe('/26')
  })

  it('should return the correct word as answer', () => {
    const { question, newLastWord } = generateWordQuestion(null)

    expect(question.answer).toBe(newLastWord)
    expect(NUMBER_TO_ALPHA_WORDS).toContain(newLastWord)
  })

  it('should correctly convert word to numbers', () => {
    const { question, newLastWord } = generateWordQuestion(null)

    // Convert answer back from numbers
    const numbers = question.question.split(', ').map((n) => parseInt(n, 10))
    const reconstructedWord = numbers
      .map((n) => String.fromCharCode(64 + n))
      .join('')

    expect(reconstructedWord).toBe(newLastWord)
  })

  it('should avoid repeating the same word consecutively', () => {
    let lastWord: string | null = null
    let hasNoRepeat = true

    for (let i = 0; i < 100; i++) {
      const { newLastWord } = generateWordQuestion(lastWord)
      if (lastWord !== null && newLastWord === lastWord) {
        hasNoRepeat = false
        break
      }
      lastWord = newLastWord
    }

    expect(hasNoRepeat).toBe(true)
  })
})

describe('NUMBER_TO_ALPHA_WORDS', () => {
  it('should contain only uppercase letters', () => {
    for (const word of NUMBER_TO_ALPHA_WORDS) {
      expect(word).toMatch(/^[A-Z]+$/)
    }
  })

  it('should contain 3-5 letter words', () => {
    for (const word of NUMBER_TO_ALPHA_WORDS) {
      expect(word.length).toBeGreaterThanOrEqual(3)
      expect(word.length).toBeLessThanOrEqual(5) // FLOCK is 5 letters
    }
  })

  it('should have a reasonable number of words', () => {
    expect(NUMBER_TO_ALPHA_WORDS.length).toBeGreaterThan(100)
  })
})
