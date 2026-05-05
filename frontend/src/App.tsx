import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Compile — Главная</h1>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
