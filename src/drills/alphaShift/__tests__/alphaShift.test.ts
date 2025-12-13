import { describe, it, expect } from 'vitest'
import { generateAlphaShiftQuestion } from '../alphaShift'

describe('generateAlphaShiftQuestion', () => {
  it('should generate a question with format "X+n" or "X-n"', () => {
    const { question } = generateAlphaShiftQuestion(null)

    // 問題文の形式をチェック: "A+1", "Z-5" など
    expect(question.question).toMatch(/^[A-Z][+-][1-5]$/)
  })

  it('should return a single uppercase letter as answer', () => {
    const { question } = generateAlphaShiftQuestion(null)

    expect(question.answer).toMatch(/^[A-Z]$/)
  })

  it('should calculate the correct answer based on shift', () => {
    // 多数の問題を生成して検証
    for (let i = 0; i < 100; i++) {
      const { question } = generateAlphaShiftQuestion(null)

      // 問題文をパース
      const match = question.question.match(/^([A-Z])([+-])(\d)$/)
      expect(match).not.toBeNull()

      const baseChar = match![1]
      const sign = match![2]
      const shiftAmount = parseInt(match![3], 10)

      // 期待される答えを計算
      const baseCode = baseChar.charCodeAt(0) - 65 // 0-25
      const shift = sign === '+' ? shiftAmount : -shiftAmount
      const expectedCode = baseCode + shift
      const expectedAnswer = String.fromCharCode(65 + expectedCode)

      expect(question.answer).toBe(expectedAnswer)
    }
  })

  it('should only generate shifts where result stays within A-Z range', () => {
    // 大量にテストして範囲外が出ないことを確認
    for (let i = 0; i < 200; i++) {
      const { question } = generateAlphaShiftQuestion(null)

      const answerCode = question.answer.charCodeAt(0) - 65
      expect(answerCode).toBeGreaterThanOrEqual(0)
      expect(answerCode).toBeLessThanOrEqual(25)
    }
  })

  it('should avoid repeating the same question consecutively', () => {
    let lastQuestion: string | null = null
    let hasNoRepeat = true

    for (let i = 0; i < 100; i++) {
      const { question, newLastQuestion } = generateAlphaShiftQuestion(lastQuestion)
      if (lastQuestion !== null && question.question === lastQuestion) {
        hasNoRepeat = false
        break
      }
      lastQuestion = newLastQuestion
    }

    expect(hasNoRepeat).toBe(true)
  })

  it('should not have subtext (unlike number-to-alpha drill)', () => {
    const { question } = generateAlphaShiftQuestion(null)
    expect(question.subtext).toBeUndefined()
  })
})
