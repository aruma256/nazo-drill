import { describe, expect, it, vi } from 'vitest'
import { checkShapeAnswer, generateShapeQuestion, PREFECTURES } from '..'
import shapes from '../shapes.json'
import { hiraganaToKatakana } from '../../../utils'

describe('都道府県の形', () => {
  it('47都道府県の名称と形状が都道府県コードで一致する', () => {
    expect(PREFECTURES).toHaveLength(47)
    expect(Object.keys(shapes)).toHaveLength(47)
    const indexedShapes: Record<
      string,
      { name: string; path: string; lakePath: string }
    > = shapes
    PREFECTURES.forEach((prefecture, index) => {
      expect(prefecture.id).toBe(index + 1)
      const shape = indexedShapes[String(prefecture.id)]
      expect(shape.name).toBe(prefecture.name)
      expect(shape.path).toMatch(/^M[\d.,MLZ]+Z$/)
      const coordinates = [...shape.path.matchAll(/[ML]([\d.]+),([\d.]+)/g)]
      expect(coordinates.length).toBeGreaterThan(20)
      for (const [, x, y] of coordinates) {
        expect(Number(x)).toBeGreaterThanOrEqual(16)
        expect(Number(x)).toBeLessThanOrEqual(304)
        expect(Number(y)).toBeGreaterThanOrEqual(16)
        expect(Number(y)).toBeLessThanOrEqual(304)
      }
      if (shape.lakePath) {
        expect(shape.lakePath).toMatch(/^M[\d.,MLZ]+Z$/)
        for (const [, x, y] of shape.lakePath.matchAll(
          /[ML]([\d.]+),([\d.]+)/g,
        )) {
          expect(Number(x)).toBeGreaterThanOrEqual(16)
          expect(Number(x)).toBeLessThanOrEqual(304)
          expect(Number(y)).toBeGreaterThanOrEqual(16)
          expect(Number(y)).toBeLessThanOrEqual(304)
        }
      }
    })
    expect(new Set(Object.values(shapes).map((shape) => shape.path)).size).toBe(
      47,
    )
  })

  it('滋賀県・茨城県・北海道の大きな湖を含む', () => {
    for (const lakePath of [
      shapes['25'].lakePath,
      shapes['8'].lakePath,
      shapes['1'].lakePath,
    ]) {
      expect(lakePath).toMatch(/^M[\d.,MLZ]+Z$/)
      expect([...lakePath.matchAll(/[ML]/g)].length).toBeGreaterThan(20)
    }
  })

  it.each(PREFECTURES)(
    '$name の名称・読み・カタカナを受け付ける',
    (prefecture) => {
      for (const answer of [
        prefecture.name,
        prefecture.reading,
        hiraganaToKatakana(prefecture.reading),
      ]) {
        expect(checkShapeAnswer(answer, prefecture)).toBe(true)
      }
      expect(checkShapeAnswer('', prefecture)).toBe(false)
    },
  )

  it('正しい接尾辞の省略、空白、半角カタカナに対応する', () => {
    const osaka = PREFECTURES[26]
    for (const answer of ['大阪', 'おおさか', 'オオサカ', ' ｵｵｻｶﾌ　']) {
      expect(checkShapeAnswer(answer, osaka)).toBe(true)
    }
    expect(checkShapeAnswer('大阪市', osaka)).toBe(false)
    expect(checkShapeAnswer('大阪県', osaka)).toBe(false)
    expect(checkShapeAnswer('京都', PREFECTURES[25])).toBe(true)
  })

  it('北海道の「道」は省略できない', () => {
    expect(checkShapeAnswer('北海', PREFECTURES[0])).toBe(false)
    expect(checkShapeAnswer('ほっかい', PREFECTURES[0])).toBe(false)
    expect(checkShapeAnswer('ほっかいどうけん', PREFECTURES[0])).toBe(false)
  })

  it('東京都は「都」の省略を認める', () => {
    const tokyo = PREFECTURES[12]
    for (const answer of [
      '東京都',
      'とうきょうと',
      '東京',
      'とうきょう',
      'トウキョウ',
    ]) {
      expect(checkShapeAnswer(answer, tokyo)).toBe(true)
    }
    expect(checkShapeAnswer('東京市', tokyo)).toBe(false)
    expect(checkShapeAnswer('新宿区', tokyo)).toBe(false)
  })

  it('異なる都道府県や誤った読みを正解にしない', () => {
    expect(checkShapeAnswer('いばらぎ', PREFECTURES[7])).toBe(false)
    expect(checkShapeAnswer('青森', PREFECTURES[0])).toBe(false)
    expect(checkShapeAnswer('札幌', PREFECTURES[0])).toBe(false)
  })

  it('都道府県名の問題を生成し、同じ形を連続出題しない', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)
    try {
      expect(generateShapeQuestion()).toEqual({
        question: '1',
        answer: '北海道',
      })
      expect(generateShapeQuestion(1)).toEqual({
        question: '2',
        answer: '青森県',
      })
      random.mockReturnValue(0.999)
      expect(generateShapeQuestion(47).question).toBe('46')
    } finally {
      random.mockRestore()
    }
  })
})
