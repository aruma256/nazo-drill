import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PREFECTURES,
  SINGLE_PREFECTURE_CHARS,
  DOUBLE_PREFECTURE_CHARS,
  replaceWithCircle,
  isUnique,
  generateQuestionString,
  generateNormalQuestion,
  generateOnePrefectureQuestion,
  generateTwoPrefecturesQuestion,
} from '../prefectureFill'
import { checkPrefectureAnswer } from '../../../utils/prefectureAnswer'

describe('prefectureFill', () => {
  describe('PREFECTURES', () => {
    it('47都道府県が含まれている', () => {
      expect(PREFECTURES).toHaveLength(47)
    })

    it('全てひらがなで構成されている', () => {
      const hiraganaPattern = /^[\u3040-\u309F]+$/
      PREFECTURES.forEach((prefecture) => {
        expect(prefecture).toMatch(hiraganaPattern)
      })
    })
  })

  describe('replaceWithCircle', () => {
    it('指定位置を◯に置換する', () => {
      expect(replaceWithCircle('とうきょう', [0])).toBe('◯うきょう')
      expect(replaceWithCircle('とうきょう', [0, 3])).toBe('◯うき◯う')
      expect(replaceWithCircle('とうきょう', [0, 2, 4])).toBe('◯う◯ょ◯')
    })

    it('空の配列なら元の文字列を返す', () => {
      expect(replaceWithCircle('とうきょう', [])).toBe('とうきょう')
    })
  })

  describe('isUnique', () => {
    it('一意に特定できる場合はtrueを返す', () => {
      // 「◯うきょう」は「とうきょう」のみにマッチ
      expect(isUnique('◯うきょう', 'とうきょう')).toBe(true)
    })

    it('複数の都道府県にマッチする場合はfalseを返す', () => {
      // 「◯◯◯」は複数にマッチするはず
      expect(isUnique('◯◯◯', 'ちば')).toBe(false)
    })

    it('長さが異なる場合はマッチしない', () => {
      // 長さが異なるので必ず一意（他にマッチしない）
      expect(isUnique('ほっかいどう', 'ほっかいどう')).toBe(true)
    })
  })

  describe('generateQuestionString', () => {
    it('少なくとも1文字は◯に置換される', () => {
      const question = generateQuestionString('とうきょう')
      expect(question).toContain('◯')
    })

    it('少なくとも1文字は見える', () => {
      const question = generateQuestionString('とうきょう')
      expect(question).not.toBeNull()
      expect(question!.replace(/◯/g, '')).not.toBe('')
    })

    it('生成された問題は一意に正解を特定できる', () => {
      // 複数回実行して確認
      for (let i = 0; i < 10; i++) {
        const prefecture = PREFECTURES[i % PREFECTURES.length]
        const question = generateQuestionString(prefecture)
        if (question) {
          expect(isUnique(question, prefecture)).toBe(true)
        }
      }
    })
  })

  describe('generateNormalQuestion', () => {
    it('問題と答えを返す', () => {
      const result = generateNormalQuestion(null)
      expect(result.question.question).toBeDefined()
      expect(result.question.answer).toBeDefined()
      expect(PREFECTURES).toContain(result.question.answer)
    })

    it('前回と異なる問題を生成する', () => {
      const first = generateNormalQuestion(null)
      const second = generateNormalQuestion(first.lastPrefecture)
      expect(second.question.answer).not.toBe(first.question.answer)
    })
  })

  describe('generateOnePrefectureQuestion', () => {
    it('1県確定の問題を生成する', () => {
      const result = generateOnePrefectureQuestion(null)
      expect(result.question.question).toMatch(/「.」を含む/)
      expect(result.question.subtext).toBe('都道府県')

      // 回答が1県確定の都道府県であることを確認
      const char = /「(.)」/.exec(result.question.question)?.[1]
      expect(char).toBeDefined()
      expect(SINGLE_PREFECTURE_CHARS[char!]).toContain(result.question.answer)
    })

    it('前回と異なる文字を出題する', () => {
      const first = generateOnePrefectureQuestion(null)
      const firstChar = /「(.)」/.exec(first.question.question)?.[1]
      const second = generateOnePrefectureQuestion(firstChar!)
      const secondChar = /「(.)」/.exec(second.question.question)?.[1]
      expect(secondChar).not.toBe(firstChar)
    })
  })

  describe('generateTwoPrefecturesQuestion', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it.each([0, 1])(
      '各文字で候補の%i番目を公開し、もう片方だけを正解にする',
      (revealedIndex) => {
        const random = vi.spyOn(Math, 'random')
        const entries = Object.entries(DOUBLE_PREFECTURE_CHARS)

        entries.forEach(([char, prefectures], charIndex) => {
          random
            .mockReturnValueOnce((charIndex + 0.5) / entries.length)
            .mockReturnValueOnce((revealedIndex + 0.5) / 2)
          const { question, lastChar } = generateTwoPrefecturesQuestion(null)
          const revealedPrefecture = prefectures[revealedIndex]
          const remainingPrefectures = prefectures.filter(
            (prefecture) => prefecture !== revealedPrefecture,
          )

          expect(question.question).toBe(`「${char}」を含む`)
          expect(lastChar).toBe(char)
          expect(question.subtext).toMatch(/^\p{Script=Han}+$/u)
          expect(
            checkPrefectureAnswer(question.subtext!, revealedPrefecture),
          ).toBe(true)
          expect(remainingPrefectures).toEqual([question.answer])
          expect(question.subtext).not.toContain(question.answer)
        })
      },
    )

    it('前回と異なる文字を出題する', () => {
      const first = generateTwoPrefecturesQuestion(null)
      const second = generateTwoPrefecturesQuestion(first.lastChar)
      expect(second.lastChar).not.toBe(first.lastChar)
    })
  })

  describe('SINGLE_PREFECTURE_CHARS', () => {
    it('各文字は1つの都道府県のみを含む', () => {
      Object.values(SINGLE_PREFECTURE_CHARS).forEach((prefectures) => {
        expect(prefectures).toHaveLength(1)
      })
    })
  })

  describe('DOUBLE_PREFECTURE_CHARS', () => {
    it('各文字は2つの都道府県を含む', () => {
      Object.values(DOUBLE_PREFECTURE_CHARS).forEach((prefectures) => {
        expect(prefectures).toHaveLength(2)
      })
    })
  })
})
