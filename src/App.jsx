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
          <p className="brand-name">Vera Willow</p>
          <h1>Coming Soon</h1>
          <p className="tagline">Wear Your Mood.</p>
          <button className="early-access" type="button">
            Get Early Access
          </button>
          <p className="handle">@verawillow</p>
        </div>
      </section>
    </main>
  )
}

export default App