import { FocusWorkspace } from "./FocusWorkspace";
import { InteractiveTools } from "./InteractiveTools";
import { StillpointClient } from "./StillpointClient";
import rhythm from "../rhythm.css?raw";
import toolkit from "../toolkit.css?raw";

export function StillpointApp() {
  return (
    <StillpointClient>
      <main>
        <a className="skip-link" href="#workspace">Direkt zum Fokus-Werkzeug</a>
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Stillpoint Startseite">still<span>.</span></a>
          <nav aria-label="Hauptnavigation">
            <a href="#workspace">Workspace</a>
            <a href="#tools">Werkzeuge</a>
            <a href="#rhythm">Dein Rhythmus</a>
          </nav>
          <a className="header-action" href="#workspace">Jetzt fokussieren <span aria-hidden="true">→</span></a>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Ein ruhiger Ort für wichtige Arbeit</p>
            <h1>Weniger<br />vorhaben. <em>Mehr</em><br />bewegen.</h1>
            <p className="hero-intro">
              Fokus, Energie und Fortschritt an einem Ort. Kostenlos, lokal gespeichert
              und ohne den Lärm klassischer Produktivitäts-Apps.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#workspace">Fokus starten <span aria-hidden="true">→</span></a>
              <a className="text-link" href="#tools">Erst umsehen <span aria-hidden="true">↓</span></a>
            </div>
            <p className="privacy-note">Keine Anmeldung · Deine Daten bleiben auf diesem Gerät</p>
          </div>
          <FocusWorkspace />
        </section>

        <div className="marquee" aria-hidden="true">
          <div>KLARHEIT <span>✦</span> FOKUS <span>✦</span> FORTSCHRITT <span>✦</span> PAUSE <span>✦</span> KLARHEIT <span>✦</span> FOKUS <span>✦</span></div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `${toolkit}\n${rhythm}` }} />

        <InteractiveTools />

        <section className="closing" aria-labelledby="closing-title">
          <p className="eyebrow"><span /> Der nächste gute Schritt</p>
          <h2 id="closing-title">Nicht mehr Zeit.<br /><em>Mehr Anwesenheit.</em></h2>
          <a className="closing-action" href="#workspace">
            <span>Zurück in den Fokus</span><span aria-hidden="true">↑</span>
          </a>
        </section>

        <footer>
          <a className="brand" href="#top">still<span>.</span></a>
          <p>Ein privater Fokusraum. Gebaut für Menschen, nicht für Metriken.</p>
          <div><a href="#tools">Werkzeuge</a><a href="#rhythm">Rhythmus</a><span>© {new Date().getFullYear()}</span></div>
        </footer>
      </main>
    </StillpointClient>
  );
}
