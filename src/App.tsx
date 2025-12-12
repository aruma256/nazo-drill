import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components'

function HomePage() {
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
        <p className="text-center text-gray-600">
          （ドリルページは今後実装予定）
        </p>
      </main>

      <footer className="mt-12 text-center text-sm text-gray-600">
        <p>© 2025 ナゾドリル - Powered by aruma256</p>
      </footer>
    </Layout>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
