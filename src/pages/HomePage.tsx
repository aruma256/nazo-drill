import { Layout, DrillCard, DrillExample, GojuonTable } from '../components'
import { SUBJECT_THEMES } from '../constants/theme'

const LOGO_BLOCKS = [
  { char: 'ナ', color: SUBJECT_THEMES.japanese.primary, rotate: '-rotate-2' },
  { char: 'ゾ', color: SUBJECT_THEMES.social.primary, rotate: 'rotate-1' },
  { char: 'ド', color: SUBJECT_THEMES.science.primary, rotate: '-rotate-1' },
  { char: 'リ', color: SUBJECT_THEMES.math.primary, rotate: 'rotate-2' },
  { char: 'ル', color: SUBJECT_THEMES.english.primary, rotate: '-rotate-1' },
]

export function HomePage() {
  return (
    <Layout maxWidth="4xl">
      {/* Hero Section */}
      <header className="mb-12 text-center">
        <h1 className="mb-4 flex justify-center gap-1.5">
          {LOGO_BLOCKS.map(({ char, color, rotate }) => (
            <span
              key={char}
              className={`${rotate} font-display inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-black text-white shadow-md md:h-14 md:w-14 md:text-3xl`}
              style={{ backgroundColor: color }}
            >
              {char}
            </span>
          ))}
        </h1>
        <p className="font-display text-lg text-gray-600 md:text-xl">
          謎解きの定番変換パターンを
          <br className="md:hidden" />
          ドリル形式でトレーニング
        </p>

        {/* Development notice */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="glass-effect rounded-2xl border border-amber-200 p-4 shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-sm">
                🚧
              </span>
              <p className="font-medium text-amber-800">開発中のサイトです</p>
            </div>
            <p className="mt-1 text-sm text-amber-600">
              一部機能が未実装または変更される可能性があります
              <br />
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSev0krl22iOQIFQ-gxm6FRRQLkSd_uuTuLaeDxxp6IX6_3_fQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 underline hover:text-amber-900"
              >
                📝 感想・バグ報告・要望 なんでもフォーム
              </a>
            </p>
          </div>
        </div>
      </header>

      {/* Drill Selection */}
      <main>
        <h2 className="font-display mb-8 text-center text-2xl font-bold text-gray-800">
          <span className="relative">
            トレーニングテーマを選択
            <span className="absolute -bottom-2 left-0 right-0 mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 五十音表の文字拾い */}
          <div>
            <DrillCard
              to="/drill/50on-pick"
              title="五十音表の文字拾い"
              description="五十音表のマークされたマスから文字を読み取る練習"
              drillId="50on-pick"
            >
              <GojuonTable
                markedCells={[
                  { row: 2, col: 9, number: 1 }, // く
                  { row: 2, col: 2, number: 2 }, // る
                  { row: 0, col: 4, number: 3 }, // ま
                ]}
                size="small"
                className="mb-2"
              />
              <div className="mt-2 text-center text-sm text-gray-500">
                <span>答え：</span>
                <span className="font-bold">くるま</span>
              </div>
            </DrillCard>
          </div>

          {/* 数字toアルファベット */}
          <div>
            <DrillCard
              to="/drill/123-abc"
              title="数字toアルファベット"
              description="数字をアルファベットに変換する練習"
              drillId="123-abc"
            >
              <DrillExample question="5, 1, 20" answer="EAT" />
            </DrillCard>
          </div>

          {/* アルファベットシフト */}
          <div>
            <DrillCard
              to="/drill/abc-shift"
              title="アルファベットシフト"
              description="アルファベットをずらして変換する練習"
              drillId="abc-shift"
            >
              <DrillExample question="C+2" answer="E" />
            </DrillCard>
          </div>

          {/* 都道府県名の穴埋め */}
          <div>
            <DrillCard
              to="/drill/prefecture-fill"
              title="都道府県名の穴埋め"
              description="◯で隠された都道府県名を当てる練習"
              drillId="prefecture-fill"
            >
              <div className="text-center">
                <div className="font-display mb-2 text-2xl font-bold tracking-widest text-gray-800">
                  ◯うき◯◯
                </div>
                <div className="text-sm text-gray-500">
                  <span>答え：</span>
                  <span className="font-bold">とうきょう</span>
                </div>
              </div>
            </DrillCard>
          </div>

          {/* おまけ謎 */}
          <div>
            <DrillCard
              to="/original-nazo"
              title="おまけ謎"
              description="サイト作者の一枚謎"
              drillId="original-nazo"
              actionLabel="チャレンジ"
            >
              <div className="text-center">
                <div className="font-display mb-2 text-4xl">?</div>
                <div className="text-sm text-gray-500">一問一答形式</div>
              </div>
            </DrillCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/50 px-6 py-3 text-sm text-gray-500 shadow-sm backdrop-blur-sm">
          <span>© 2025 ナゾドリル</span>
          <span className="text-gray-300">|</span>
          <span>Powered by aruma256</span>
        </div>
      </footer>
    </Layout>
  )
}
