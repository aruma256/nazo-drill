import { describe, it, expect } from 'vitest'
import { generateAlphaShiftQuestion } from '../alphaShift'

describe('generateAlphaShiftQuestion', () => {
  describe('plus-training mode', () => {
    it('should generate a question with format "X+n" where n is 1-3', () => {
      for (let i = 0; i < 50; i++) {
        const { question } = generateAlphaShiftQuestion(null, 'plus-training')
        expect(question.question).toMatch(/^[A-Z]\+[1-3]$/)
      }
    })

    it('should return a single uppercase letter as answer', () => {
      const { question } = generateAlphaShiftQuestion(null, 'plus-training')
      expect(question.answer).toMatch(/^[A-Z]$/)
    })

    it('should calculate the correct answer based on shift', () => {
      for (let i = 0; i < 100; i++) {
        const { question } = generateAlphaShiftQuestion(null, 'plus-training')

        const match = /^([A-Z])\+(\d)$/.exec(question.question)
        expect(match).not.toBeNull()

        const baseChar = match![1]
        const shiftAmount = parseInt(match![2], 10)

        const baseCode = baseChar.charCodeAt(0) - 65
        const expectedCode = baseCode + shiftAmount
        const expectedAnswer = String.fromCharCode(65 + expectedCode)

        expect(question.answer).toBe(expectedAnswer)
      }
    })

    it('should only generate shifts where result stays within A-Z range', () => {
      for (let i = 0; i < 200; i++) {
        const { question } = generateAlphaShiftQuestion(null, 'plus-training')

        const answerCode = question.answer.charCodeAt(0) - 65
        expect(answerCode).toBeGreaterThanOrEqual(0)
        expect(answerCode).toBeLessThanOrEqual(25)
      }
    })

    it('should avoid repeating the same question consecutively', () => {
      let lastQuestion: string | null = null
      let hasNoRepeat = true

      for (let i = 0; i < 100; i++) {
        const { question, newLastQuestion } = generateAlphaShiftQuestion(
          lastQuestion,
          'plus-training',
        )
        if (lastQuestion !== null && question.question === lastQuestion) {
          hasNoRepeat = false
          break
        }
        lastQuestion = newLastQuestion
      }

      expect(hasNoRepeat).toBe(true)
    })
  })

  describe('minus-training mode', () => {
    it('should generate a question with format "X-n" where n is 1-3', () => {
      for (let i = 0; i < 50; i++) {
        const { question } = generateAlphaShiftQuestion(null, 'minus-training')
        expect(question.question).toMatch(/^[A-Z]-[1-3]$/)
      }
    })

    it('should return a single uppercase letter as answer', () => {
      const { question } = generateAlphaShiftQuestion(null, 'minus-training')
      expect(question.answer).toMatch(/^[A-Z]$/)
    })

    it('should calculate the correct answer based on shift', () => {
      for (let i = 0; i < 100; i++) {
        const { question } = generateAlphaShiftQuestion(null, 'minus-training')

        const match = /^([A-Z])-(\d)$/.exec(question.question)
        expect(match).not.toBeNull()

        const baseChar = match![1]
        const shiftAmount = parseInt(match![2], 10)

        const baseCode = baseChar.charCodeAt(0) - 65
        const expectedCode = baseCode - shiftAmount
        const expectedAnswer = String.fromCharCode(65 + expectedCode)

        expect(question.answer).toBe(expectedAnswer)
      }
    })

    it('should only generate shifts where result stays within A-Z range', () => {
      for (let i = 0; i < 200; i++) {
        const { question } = generateAlphaShiftQuestion(null, 'minus-training')

        const answerCode = question.answer.charCodeAt(0) - 65
        expect(answerCode).toBeGreaterThanOrEqual(0)
        expect(answerCode).toBeLessThanOrEqual(25)
      }
    })

    it('should avoid repeating the same question consecutively', () => {
      let lastQuestion: string | null = null
      let hasNoRepeat = true

      for (let i = 0; i < 100; i++) {
        const { question, newLastQuestion } = generateAlphaShiftQuestion(
          lastQuestion,
          'minus-training',
        )
        if (lastQuestion !== null && question.question === lastQuestion) {
          hasNoRepeat = false
          break
        }
        lastQuestion = newLastQuestion
      }

      expect(hasNoRepeat).toBe(true)
    })
  })

  it('should not have subtext (unlike number-to-alpha drill)', () => {
    const { question } = generateAlphaShiftQuestion(null, 'plus-training')
    expect(question.subtext).toBeUndefined()
  })
})
