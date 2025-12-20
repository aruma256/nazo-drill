import { describe, expect, it } from 'vitest'
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
  normalizeAnswer,
  checkTwoPrefecturesAnswer,
  KANJI_TO_HIRAGANA,
} from '../prefectureFill'

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
    it('2県確定の問題を生成する', () => {
      const result = generateTwoPrefecturesQuestion(null)
      expect(result.question.question).toMatch(/「.」を含む/)
      expect(result.question.subtext).toBe('都道府県')

      // 回答が2つの都道府県であることを確認
      const answers = result.question.answer.split(' ')
      expect(answers).toHaveLength(2)
    })

    it('回答はソートされている', () => {
      const result = generateTwoPrefecturesQuestion(null)
      const answers = result.question.answer.split(' ')
      expect(answers).toEqual([...answers].sort())
    })
  })

  describe('normalizeAnswer', () => {
    it('カタカナをひらがなに変換する', () => {
      expect(normalizeAnswer('トウキョウ')).toBe('とうきょう')
    })

    it('漢字をひらがなに変換する', () => {
      expect(normalizeAnswer('東京')).toBe('とうきょう')
      expect(normalizeAnswer('北海道')).toBe('ほっかいどう')
    })

    it('前後の空白を削除する', () => {
      expect(normalizeAnswer(' とうきょう ')).toBe('とうきょう')
    })

    it('ひらがなはそのまま', () => {
      expect(normalizeAnswer('とうきょう')).toBe('とうきょう')
    })
  })

  describe('checkTwoPrefecturesAnswer', () => {
    it('正しい順序で回答した場合', () => {
      expect(checkTwoPrefecturesAnswer('えひめ みえ', 'えひめ みえ')).toBe(true)
    })

    it('逆順で回答した場合もOK', () => {
      expect(checkTwoPrefecturesAnswer('みえ えひめ', 'えひめ みえ')).toBe(true)
    })

    it('カンマ区切りでもOK', () => {
      expect(checkTwoPrefecturesAnswer('えひめ,みえ', 'えひめ みえ')).toBe(true)
    })

    it('読点区切りでもOK', () => {
      const result = checkTwoPrefecturesAnswer('えひめ、みえ', 'えひめ みえ')
      expect(result).toBe(true)
    })

    it('全角スペース区切りでもOK', () => {
      // 全角スペース(\u3000)を使った区切り
      const result = checkTwoPrefecturesAnswer(
        'えひめ\u3000みえ',
        'えひめ みえ',
      )
      expect(result).toBe(true)
    })

    it('間違った回答は不正解', () => {
      expect(checkTwoPrefecturesAnswer('えひめ なら', 'えひめ みえ')).toBe(
        false,
      )
    })
  })

  describe('KANJI_TO_HIRAGANA', () => {
    it('47都道府県分のマッピングがある', () => {
      expect(Object.keys(KANJI_TO_HIRAGANA)).toHaveLength(47)
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
