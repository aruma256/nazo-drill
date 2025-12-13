import { HashRouter, Routes, Route } from 'react-router-dom'
import { HomePage, GojuonPickPage, NumberToAlphaPage } from './pages'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drill/50on-pick" element={<GojuonPickPage />} />
        <Route path="/drill/123-abc" element={<NumberToAlphaPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
