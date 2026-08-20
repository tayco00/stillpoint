import { FocusWorkspace } from "./FocusWorkspace";
import { FirstRunOnboarding, PersonalHeroIntro } from "./FirstRunOnboarding";
import { InteractiveTools } from "./InteractiveTools";
import { DesktopSettings } from "./DesktopSettings";
import { ResumeCard } from "./SessionContinuity";
import { StillpointClient } from "./StillpointClient";
import { ProfilePicker } from "./ProfilePicker";
import continuity from "../continuity.css?raw";
import onboarding from "../onboarding.css?raw";
import rhythm from "../rhythm.css?raw";
import settings from "../settings.css?raw";
import profiles from "../profiles.css?raw";
import toolkit from "../toolkit.css?raw";

const MARQUEE_ITEMS = ["KLARHEIT", "FOKUS", "FORTSCHRITT", "PAUSE", "KLARHEIT", "FOKUS"];

export function StillpointApp({ desktop = false }: { desktop?: boolean }) {
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
          <div className="header-controls">
            <a className="header-action" href="#workspace">Jetzt fokussieren <span aria-hidden="true">→</span></a>
            {desktop ? <DesktopSettings /> : null}
          </div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <h1>Weniger<br />vorhaben. <em>Mehr</em><br />bewegen.</h1>
            <PersonalHeroIntro enabled={desktop} />
            <div className="hero-actions">
              <a className="primary-button" href="#workspace">Fokus starten <span aria-hidden="true">→</span></a>
              <a className="text-link" href="#tools">Erst umsehen <span aria-hidden="true">↓</span></a>
            </div>
            {desktop ? <ResumeCard /> : null}
          </div>
          <FocusWorkspace />
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <div className="marquee-group" key={copy}>
                {MARQUEE_ITEMS.map((item, index) => (
                  <span className="marquee-item" key={`${copy}-${item}-${index}`}>
                    <strong>{item}</strong>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `${toolkit}\n${rhythm}\n${onboarding}\n${continuity}\n${settings}\n${profiles}` }} />

        <InteractiveTools />

        <section className="closing" aria-labelledby="closing-title">
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
      <FirstRunOnboarding enabled={desktop} />
      <ProfilePicker enabled={desktop} />
    </StillpointClient>
  );
}
