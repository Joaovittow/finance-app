import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import QuinzenaPage from './components/QuinzenaPage'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quinzena/:id" element={<QuinzenaPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App