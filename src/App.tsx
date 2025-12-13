import { HashRouter, Routes, Route } from 'react-router-dom'
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drill/50on-pick" element={<GojuonPickPage />} />
        <Route path="/drill/123-abc" element={<NumberToAlphaPage />} />
        <Route path="/drill/abc-shift" element={<AlphaShiftPage />} />
        <Route path="/drill/prefecture-fill" element={<PrefectureFillPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
