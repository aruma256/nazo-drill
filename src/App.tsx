import { HashRouter, Routes, Route } from 'react-router-dom'
import { HomePage, GojuonPickPage } from './pages'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drill/50on-pick" element={<GojuonPickPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
