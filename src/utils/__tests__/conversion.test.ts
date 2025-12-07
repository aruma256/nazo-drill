import { describe, expect, it } from 'vitest'
import {
  numberToAlpha,
  alphaToNumber,
  shiftAlpha,
  katakanaToHiragana,
  hiraganaToKatakana,
} from '../conversion'

describe('numberToAlpha', () => {
  it('should convert 1 to A', () => {
    expect(numberToAlpha(1)).toBe('A')
  })

  it('should convert 26 to Z', () => {
    expect(numberToAlpha(26)).toBe('Z')
  })
})

describe('alphaToNumber', () => {
  it('should convert A to 1', () => {
    expect(alphaToNumber('A')).toBe(1)
  })

  it('should convert Z to 26', () => {
    expect(alphaToNumber('Z')).toBe(26)
  })

  it('should handle lowercase letters', () => {
    expect(alphaToNumber('a')).toBe(1)
    expect(alphaToNumber('z')).toBe(26)
  })
})

describe('shiftAlpha', () => {
  it('should shift A by 1 to B', () => {
    expect(shiftAlpha('A', 1)).toBe('B')
  })

  it('should wrap Z + 1 to A', () => {
    expect(shiftAlpha('Z', 1)).toBe('A')
  })

  it('should handle negative shifts', () => {
    expect(shiftAlpha('B', -1)).toBe('A')
    expect(shiftAlpha('A', -1)).toBe('Z')
  })

  it('should handle large shifts', () => {
    expect(shiftAlpha('A', 26)).toBe('A')
    expect(shiftAlpha('A', 27)).toBe('B')
  })
})

describe('katakanaToHiragana', () => {
  it('should convert katakana to hiragana', () => {
    expect(katakanaToHiragana('アイウエオ')).toBe('あいうえお')
  })

  it('should not modify hiragana', () => {
    expect(katakanaToHiragana('あいうえお')).toBe('あいうえお')
  })

  it('should handle mixed text', () => {
    expect(katakanaToHiragana('アイうえオ')).toBe('あいうえお')
  })
})

describe('hiraganaToKatakana', () => {
  it('should convert hiragana to katakana', () => {
    expect(hiraganaToKatakana('あいうえお')).toBe('アイウエオ')
  })

  it('should not modify katakana', () => {
    expect(hiraganaToKatakana('アイウエオ')).toBe('アイウエオ')
  })

  it('should handle mixed text', () => {
    expect(hiraganaToKatakana('あいウエお')).toBe('アイウエオ')
  })
})
