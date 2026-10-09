import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import AboutPage from './pages/AboutPage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  const [page, setPage] = useState<'home' | 'about'>('home')

  return (
    <div className="site-shell">
      <Header page={page} setPage={setPage} />
      {page === 'home' ? <HomePage /> : <AboutPage />}
      <Footer setPage={setPage} />
    </div>
  )
}

export default App