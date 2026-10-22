import { useState } from 'react'
import Wordmark from './Wordmark'

type HeaderProps = {
  // 'involved' has no nav tab of its own; the type just keeps this prop in sync with the router.
  page: 'home' | 'about' | 'donate' | 'involved'
  setPage: (page: 'home' | 'about' | 'donate') => void
}

function Header({ page, setPage }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function navigate(nextPage: 'home' | 'about' | 'donate') {
    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <a className="brand-link" href="#home" onClick={(event) => { event.preventDefault(); navigate('home') }} aria-label="SaveEarth home">
        <Wordmark />
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span /><span />
      </button>
      <nav className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <button className={page === 'home' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => navigate('home')}>Home</button>
        <button className={page === 'about' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => navigate('about')}>About</button>
        <a className="nav-donate" href="#support" onClick={(event) => { event.preventDefault(); navigate('donate') }}>Support our work <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}

export default Header