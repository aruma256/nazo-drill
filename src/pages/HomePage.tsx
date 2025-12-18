import { Layout, DrillCard, DrillExample, GojuonTable } from '../components'

export function HomePage() {
  return (
    <Layout maxWidth="4xl">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-indigo-900 md:text-5xl">
          ナゾドリル
        </h1>
        <p className="text-lg text-gray-700">
          謎解きの定番変換パターンを
          <br className="md:hidden" />
          ドリル形式でトレーニング
        </p>
        <div className="mt-6 rounded border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-800">
          <p className="font-semibold">開発中のサイトです</p>
          <p className="mt-1 text-sm">
            一部機能が未実装または変更される可能性があります。
          </p>
        </div>
      </header>

      <main>
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          トレーニングテーマを選択
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <DrillCard
            to="/drill/50on-pick"
            title="五十音表の文字拾い"
            description="五十音表のマークされたマスから文字を読み取る練習"
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
              答え：<span className="font-bold text-green-600">くるま</span>
            </div>
          </DrillCard>

          <DrillCard
            to="/drill/123-abc"
            title="数字toアルファベット"
            description="数字をアルファベットに変換する練習"
          >
            <DrillExample question="5, 1, 20" answer="EAT" />
          </DrillCard>

          <DrillCard
            to="/drill/abc-shift"
            title="アルファベットシフト"
            description="アルファベットをずらして変換する練習"
          >
            <DrillExample question="C+2" answer="E" />
          </DrillCard>

          <DrillCard
            to="/drill/prefecture-fill"
            title="都道府県名の穴埋め"
            description="◯で隠された都道府県名を当てる練習"
          >
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="mb-1 text-2xl font-bold tracking-widest text-indigo-900">
                ◯うき◯◯
              </div>
              <div className="text-sm text-gray-500">
                答え：
                <span className="font-bold text-green-600">とうきょう</span>
              </div>
            </div>
          </DrillCard>
        </div>
      </main>

      <footer className="mt-12 text-center text-sm text-gray-600">
        <p>© 2025 ナゾドリル - Powered by aruma256</p>
      </footer>
    </Layout>
  )
}
