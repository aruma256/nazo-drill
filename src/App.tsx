import { HashRouter, Routes, Route } from 'react-router-dom'
import { DecorativeElements } from './components/DecorativeElements'
import {
  HomePage,
  GojuonPickPage,
  NumberToAlphaPage,
  AlphaShiftPage,
  PrefectureFillPage,
} from './pages'

function App() {
  return (
    <HashRouter>
      <div
        className="relative min-h-screen overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--drill-primary-light) 0%, #f0f4ff 50%, #faf5ff 100%)',
        }}
      >
        <DecorativeElements />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/drill/50on-pick" element={<GojuonPickPage />} />
          <Route path="/drill/123-abc" element={<NumberToAlphaPage />} />
          <Route path="/drill/abc-shift" element={<AlphaShiftPage />} />
          <Route
            path="/drill/prefecture-fill"
            element={<PrefectureFillPage />}
          />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
