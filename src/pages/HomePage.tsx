import { Layout, DrillCard, DrillExample, GojuonTable } from '../components'

export function HomePage() {
  return (
    <Layout maxWidth="4xl">
      <header className="mb-12 text-center">
        <h1 className="site-title mb-4">ナゾドリル</h1>
        <p style={{ color: 'var(--color-ink-light)', fontSize: '1.125rem' }}>
          謎解きの定番変換パターンを
          <br className="md:hidden" />
          ドリル形式でトレーニング
        </p>
        <div className="dev-banner mt-6">
          <p className="font-semibold">開発中のサイトです</p>
          <p className="mt-1 text-sm">
            一部機能が未実装または変更される可能性があります。
          </p>
        </div>
      </header>

      <main>
        <h2
          className="mb-6 text-center text-2xl font-bold"
          style={{ color: 'var(--color-ink)' }}
        >
          トレーニングテーマを選択
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <DrillCard
            to="/drill/50on-pick"
            title="五十音表の文字拾い"
            description="五十音表のマークされたマスから文字を読み取る練習"
            theme="gojuon"
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
            <div
              className="mt-2 text-center text-sm"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              答え：
              <span
                className="font-bold"
                style={{ color: 'var(--color-correct)' }}
              >
                くるま
              </span>
            </div>
          </DrillCard>

          <DrillCard
            to="/drill/123-abc"
            title="数字toアルファベット"
            description="数字をアルファベットに変換する練習"
            theme="num"
          >
            <DrillExample question="5, 1, 20" answer="EAT" />
          </DrillCard>

          <DrillCard
            to="/drill/abc-shift"
            title="アルファベットシフト"
            description="アルファベットをずらして変換する練習"
            theme="shift"
          >
            <DrillExample question="C+2" answer="E" />
          </DrillCard>

          <DrillCard
            to="/drill/prefecture-fill"
            title="都道府県名の穴埋め"
            description="◯で隠された都道府県名を当てる練習"
            theme="pref"
          >
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: 'var(--color-paper-warm)' }}
            >
              <div
                className="mb-1 text-2xl font-bold tracking-widest"
                style={{ color: 'var(--drill-primary)' }}
              >
                ◯うき◯◯
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--color-ink-muted)' }}
              >
                答え：
                <span
                  className="font-bold"
                  style={{ color: 'var(--color-correct)' }}
                >
                  とうきょう
                </span>
              </div>
            </div>
          </DrillCard>
        </div>
      </main>

      <footer className="site-footer mt-12 text-center">
        <p>© 2025 ナゾドリル - Powered by aruma256</p>
      </footer>
    </Layout>
  )
}
