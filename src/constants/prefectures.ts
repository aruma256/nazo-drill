type Region =
  | '北海道地方'
  | '東北地方'
  | '関東地方'
  | '中部地方'
  | '近畿地方'
  | '中国地方'
  | '四国地方'
  | '九州・沖縄地方'

export interface Prefecture {
  id: number
  name: string
  reading: string
  shortName: string
  shortReading: string
  region: Region
}

// 都道府県コード順。
const PREFECTURE_DATA: readonly Omit<
  Prefecture,
  'shortName' | 'shortReading'
>[] = [
  {
    id: 1,
    name: '北海道',
    reading: 'ほっかいどう',
    region: '北海道地方',
  },
  {
    id: 2,
    name: '青森県',
    reading: 'あおもりけん',
    region: '東北地方',
  },
  {
    id: 3,
    name: '岩手県',
    reading: 'いわてけん',
    region: '東北地方',
  },
  {
    id: 4,
    name: '宮城県',
    reading: 'みやぎけん',
    region: '東北地方',
  },
  {
    id: 5,
    name: '秋田県',
    reading: 'あきたけん',
    region: '東北地方',
  },
  {
    id: 6,
    name: '山形県',
    reading: 'やまがたけん',
    region: '東北地方',
  },
  {
    id: 7,
    name: '福島県',
    reading: 'ふくしまけん',
    region: '東北地方',
  },
  {
    id: 8,
    name: '茨城県',
    reading: 'いばらきけん',
    region: '関東地方',
  },
  {
    id: 9,
    name: '栃木県',
    reading: 'とちぎけん',
    region: '関東地方',
  },
  {
    id: 10,
    name: '群馬県',
    reading: 'ぐんまけん',
    region: '関東地方',
  },
  {
    id: 11,
    name: '埼玉県',
    reading: 'さいたまけん',
    region: '関東地方',
  },
  {
    id: 12,
    name: '千葉県',
    reading: 'ちばけん',
    region: '関東地方',
  },
  {
    id: 13,
    name: '東京都',
    reading: 'とうきょうと',
    region: '関東地方',
  },
  {
    id: 14,
    name: '神奈川県',
    reading: 'かながわけん',
    region: '関東地方',
  },
  {
    id: 15,
    name: '新潟県',
    reading: 'にいがたけん',
    region: '中部地方',
  },
  {
    id: 16,
    name: '富山県',
    reading: 'とやまけん',
    region: '中部地方',
  },
  {
    id: 17,
    name: '石川県',
    reading: 'いしかわけん',
    region: '中部地方',
  },
  {
    id: 18,
    name: '福井県',
    reading: 'ふくいけん',
    region: '中部地方',
  },
  {
    id: 19,
    name: '山梨県',
    reading: 'やまなしけん',
    region: '中部地方',
  },
  {
    id: 20,
    name: '長野県',
    reading: 'ながのけん',
    region: '中部地方',
  },
  {
    id: 21,
    name: '岐阜県',
    reading: 'ぎふけん',
    region: '中部地方',
  },
  {
    id: 22,
    name: '静岡県',
    reading: 'しずおかけん',
    region: '中部地方',
  },
  {
    id: 23,
    name: '愛知県',
    reading: 'あいちけん',
    region: '中部地方',
  },
  {
    id: 24,
    name: '三重県',
    reading: 'みえけん',
    region: '近畿地方',
  },
  {
    id: 25,
    name: '滋賀県',
    reading: 'しがけん',
    region: '近畿地方',
  },
  {
    id: 26,
    name: '京都府',
    reading: 'きょうとふ',
    region: '近畿地方',
  },
  {
    id: 27,
    name: '大阪府',
    reading: 'おおさかふ',
    region: '近畿地方',
  },
  {
    id: 28,
    name: '兵庫県',
    reading: 'ひょうごけん',
    region: '近畿地方',
  },
  {
    id: 29,
    name: '奈良県',
    reading: 'ならけん',
    region: '近畿地方',
  },
  {
    id: 30,
    name: '和歌山県',
    reading: 'わかやまけん',
    region: '近畿地方',
  },
  {
    id: 31,
    name: '鳥取県',
    reading: 'とっとりけん',
    region: '中国地方',
  },
  {
    id: 32,
    name: '島根県',
    reading: 'しまねけん',
    region: '中国地方',
  },
  {
    id: 33,
    name: '岡山県',
    reading: 'おかやまけん',
    region: '中国地方',
  },
  {
    id: 34,
    name: '広島県',
    reading: 'ひろしまけん',
    region: '中国地方',
  },
  {
    id: 35,
    name: '山口県',
    reading: 'やまぐちけん',
    region: '中国地方',
  },
  {
    id: 36,
    name: '徳島県',
    reading: 'とくしまけん',
    region: '四国地方',
  },
  {
    id: 37,
    name: '香川県',
    reading: 'かがわけん',
    region: '四国地方',
  },
  {
    id: 38,
    name: '愛媛県',
    reading: 'えひめけん',
    region: '四国地方',
  },
  {
    id: 39,
    name: '高知県',
    reading: 'こうちけん',
    region: '四国地方',
  },
  {
    id: 40,
    name: '福岡県',
    reading: 'ふくおかけん',
    region: '九州・沖縄地方',
  },
  {
    id: 41,
    name: '佐賀県',
    reading: 'さがけん',
    region: '九州・沖縄地方',
  },
  {
    id: 42,
    name: '長崎県',
    reading: 'ながさきけん',
    region: '九州・沖縄地方',
  },
  {
    id: 43,
    name: '熊本県',
    reading: 'くまもとけん',
    region: '九州・沖縄地方',
  },
  {
    id: 44,
    name: '大分県',
    reading: 'おおいたけん',
    region: '九州・沖縄地方',
  },
  {
    id: 45,
    name: '宮崎県',
    reading: 'みやざきけん',
    region: '九州・沖縄地方',
  },
  {
    id: 46,
    name: '鹿児島県',
    reading: 'かごしまけん',
    region: '九州・沖縄地方',
  },
  {
    id: 47,
    name: '沖縄県',
    reading: 'おきなわけん',
    region: '九州・沖縄地方',
  },
]

/** 正式名・読み・地方と、ドリルで使う略称をまとめた共通データ。 */
export const PREFECTURES: readonly Prefecture[] = PREFECTURE_DATA.map(
  (prefecture) => {
    const { name, reading } = prefecture
    // 北海道の「道」は名前の一部なので省略しない。
    const isHokkaido = name === '北海道'
    const readingSuffixLength = name.endsWith('県') ? 2 : 1
    return {
      ...prefecture,
      shortName: isHokkaido ? name : name.slice(0, -1),
      shortReading: isHokkaido
        ? reading
        : reading.slice(0, -readingSuffixLength),
    }
  },
)
