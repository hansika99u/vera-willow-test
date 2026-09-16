import SilkCloth from './components/SilkCloth/SilkCloth'
import './App.css'

function App() {
  return (
    <main className="page">
      <div className="silk-background">
        <SilkCloth />
      </div>

      <section className="content">
        <div className="brand-lockup">
          <div className="brand-heading">
            <p className="brand-name">Vera Willow</p>
          </div>

          <div className="hero-message">
            <h1>Coming Soon</h1>
            <p className="tagline">Wear Your Mood.</p>
          </div>

          <div className="action-area">
            <button className="early-access" type="button">
              Get Early Access
            </button>
          </div>

          <div className="community-area">
            <p className="handle">@verawillow</p>
            <nav className="social-links" aria-label="Social media">
              <a href="https://www.facebook.com/profile.php?id=61586561345281" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href="https://www.instagram.com/verawillowofficial/" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://www.tiktok.com/@vera_willow?_r=1&_t=ZS-99n5qwZbpnZ" target="_blank" rel="noreferrer">
                TikTok
              </a>
            </nav>
          </div>
        </div>
      </section>
    </main>
  )
}


export default App