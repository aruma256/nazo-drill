import { Layout, DrillCard, DrillExample, GojuonTable } from '../components'

const LOGO_BLOCKS = [
  { char: 'ナ', color: '#e11d48', rotate: '-rotate-2' }, // 国語(赤)
  { char: 'ゾ', color: '#ea580c', rotate: 'rotate-1' }, // 社会(橙)
  { char: 'ド', color: '#16a34a', rotate: '-rotate-1' }, // 理科(緑)
  { char: 'リ', color: '#0284c7', rotate: 'rotate-2' }, // 算数(青)
  { char: 'ル', color: '#7c3aed', rotate: '-rotate-1' }, // 英語(紫)
]

export function HomePage() {
  return (
    <Layout maxWidth="4xl">
      {/* Hero Section */}
      <header className="animate-fade-in-up mb-12 text-center">
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
            </p>
          </div>
        </div>
      </header>

      {/* Drill Selection */}
      <main>
        <h2 className="animate-fade-in-up animate-delay-100 font-display mb-8 text-center text-2xl font-bold text-gray-800">
          <span className="relative">
            トレーニングテーマを選択
            <span className="absolute -bottom-2 left-0 right-0 mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 五十音表の文字拾い */}
          <div className="animate-fade-in-up animate-delay-200">
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
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>答え：</span>
                <span className="rounded-lg bg-rose-100 px-3 py-1 font-bold text-rose-600">
                  くるま
                </span>
              </div>
            </DrillCard>
          </div>

          {/* 数字toアルファベット */}
          <div className="animate-fade-in-up animate-delay-300">
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
          <div className="animate-fade-in-up animate-delay-400">
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
          <div className="animate-fade-in-up animate-delay-500">
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
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>答え：</span>
                  <span className="rounded-lg bg-amber-100 px-3 py-1 font-bold text-amber-600">
                    とうきょう
                  </span>
                </div>
              </div>
            </DrillCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="animate-fade-in mt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/50 px-6 py-3 text-sm text-gray-500 shadow-sm backdrop-blur-sm">
          <span>© 2025 ナゾドリル</span>
          <span className="text-gray-300">|</span>
          <span>Powered by aruma256</span>
        </div>
      </footer>
    </Layout>
  )
}
