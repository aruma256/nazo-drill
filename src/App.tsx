import { HashRouter, Routes, Route } from 'react-router-dom'
import { DecorativeElements } from './components/DecorativeElements'
import { ScrollToTop } from './components'
import {
  HomePage,
  GojuonPickPage,
  GojuonSlidePage,
  NumberToAlphaPage,
  AlphaShiftPage,
  PrefectureFillPage,
  OriginalNazoPage,
} from './pages'

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div
        className="relative min-h-screen overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #faf5ff 100%)',
        }}
      >
        <DecorativeElements />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/drill/50on-pick" element={<GojuonPickPage />} />
          <Route path="/drill/50on-slide" element={<GojuonSlidePage />} />
          <Route path="/drill/123-abc" element={<NumberToAlphaPage />} />
          <Route path="/drill/abc-shift" element={<AlphaShiftPage />} />
          <Route
            path="/drill/prefecture-fill"
            element={<PrefectureFillPage />}
          />
          <Route path="/original-nazo" element={<OriginalNazoPage />} />
          <Route
            path="/original-nazo/:questionId"
            element={<OriginalNazoPage />}
          />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
