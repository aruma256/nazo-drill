import { describe, expect, it } from 'vitest'
import { PREFECTURES } from '../../constants/prefectures'
import { hiraganaToKatakana } from '../conversion'
import { checkPrefectureAnswer } from '../prefectureAnswer'

describe('都道府県名の共通回答判定', () => {
  it.each(PREFECTURES)(
    '$name の正式名・略称・読みを、漢字とかなで受け付ける',
    ({ name, reading, shortName, shortReading }) => {
      for (const answer of [
        name,
        shortName,
        reading,
        shortReading,
        hiraganaToKatakana(reading),
        hiraganaToKatakana(shortReading),
      ]) {
        // 形の問題は正式名、穴埋めの問題は短い読みを正解データに持つ。
        expect(checkPrefectureAnswer(answer, name)).toBe(true)
        expect(checkPrefectureAnswer(answer, shortReading)).toBe(true)
      }
      for (const other of PREFECTURES.filter(
        (prefecture) => prefecture.name !== name,
      )) {
        expect(checkPrefectureAnswer(other.name, shortReading)).toBe(false)
      }
    },
  )

  it.each([
    ['ﾄｳｷｮｳﾄ', 'とうきょう'],
    ['ｵｵｻｶﾌ', '大阪府'],
    ['ﾆｲｶﾞﾀｹﾝ', 'にいがた'],
    ['ﾎｯｶｲﾄﾞｳ', '北海道'],
    [' 愛 媛 県　', 'えひめ'],
    [' にいか\u3099たけん ', '新潟県'],
  ])('%s の半角・空白・分離した濁点を正規化する', (answer, expected) => {
    expect(checkPrefectureAnswer(answer, expected)).toBe(true)
  })

  it.each([
    ['北海', '北海道'],
    ['ほっかい', 'ほっかいどう'],
    ['北海道県', '北海道'],
    ['大阪県', 'おおさか'],
    ['大阪市', '大阪府'],
    ['東京市', 'とうきょう'],
    ['東京都県', '東京都'],
    ['新宿区', '東京都'],
    ['いばらぎ', 'いばらき'],
    ['みえ えひめ', 'えひめ'],
    ['', '東京都'],
    ['　 ', 'とうきょう'],
    ['', ''],
    ['架空県', '架空県'],
  ])('%s は %s の正解にしない', (answer, expected) => {
    expect(checkPrefectureAnswer(answer, expected)).toBe(false)
  })
})
