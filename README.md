# Stillpoint

Stillpoint ist ein privater Fokusraum für Windows. Die Anwendung hilft dabei,
eine klare Aufgabe zu beginnen, Ablenkungen aus dem Kopf zu bekommen und nach
einer Arbeitseinheit bewusst den nächsten Schritt festzuhalten.

Die jeweils aktuelle Version steht unter
[GitHub Releases](https://github.com/tayco00/stillpoint/releases/latest).
Stillpoint wird ausschließlich als Desktop-Anwendung veröffentlicht – es gibt
keine öffentliche Web-Version.

## Die Idee

Stillpoint soll kein weiteres Produktivitätssystem sein, das gepflegt werden
muss. Statt Aufgabenlisten, Punktesystemen und künstlichen Erfolgsserien steht
ein ruhiger Arbeitsablauf im Mittelpunkt:

1. Eine Aufgabe auswählen.
2. Die eigene Energie ehrlich einschätzen.
3. Eine überschaubare Fokuszeit beginnen.
4. Ablenkende Gedanken parken, ohne die Aufgabe zu verlassen.
5. Nach der Session festhalten, was bewegt wurde und wie es weitergeht.

Fortschritt wird sichtbar gemacht, aber nicht bewertet. Stillpoint verwendet
keine Werbung, keine künstliche Dringlichkeit und keine Mechanismen, die
Menschen möglichst lange in der Anwendung halten sollen.

## Funktionen

### Fokus und Abschluss

- Fokus-Timer für 25, 45 oder 60 Minuten
- Frei formulierbares Ziel für die aktuelle Session
- Pausieren, Fortsetzen und Zurücksetzen mit korrekter Zeitmessung
- Abschlussdialog für Ergebnis und nächsten guten Schritt
- Persönliche Begrüßung nach einer einmaligen Namensabfrage
- 28 wechselnde, neutrale Beispielnamen im Erststart-Feld
- Wiederaufnahme des zuletzt festgehaltenen nächsten Schritts

### Werkzeuge

- 42-Sekunden-Atemübung im Rhythmus 4–4–6
- Energie-Check mit passender Empfehlung für die Fokusdauer
- Parkplatz für ablenkende Gedanken
- Schnellnotiz aus dem Windows-Infobereich oder mit
  `Strg + Umschalt + Leertaste`
- Offline erzeugte Klangräume: Regen, tiefe Ruhe und weicher Raum
- Einstellbare, ruhige Windows-Erinnerungen nach 30, 60, 90 oder 120 Minuten

### Rückblick

- Tagesübersicht für Sessions, Fokusminuten und Atempausen
- Verlauf der letzten sieben Tage
- Wochenrückblick mit Fokuszeit, bevorzugter Tageszeit und Energiemuster
- Kurze Tagesreflexion
- Lokales Löschen aller gespeicherten Stillpoint-Daten direkt in der Anwendung

## Installation unter Windows

Stillpoint wird über einen normalen Windows-Installer verteilt.

1. Den aktuellen
   [Stillpoint-Installer herunterladen](https://github.com/tayco00/stillpoint/releases/latest/download/Stillpoint-Setup.exe).
2. `Stillpoint-Setup.exe` öffnen.
3. Falls gewünscht, den Installationsordner auswählen und die Installation
   abschließen.
4. Stillpoint anschließend über die Desktop- oder Startmenü-Verknüpfung öffnen.

Die Anwendung heißt in Windows, im Startmenü und auf dem Desktop ausschließlich
**Stillpoint**. Je nach Windows-Konfiguration kann beim ersten Start eine
SmartScreen-Rückfrage erscheinen.

Wer Stillpoint nur verwenden oder testen möchte, braucht weder den Quellcode
noch die ZIP-Datei des Repositories – der Installer genügt.

## Updates

Installierte Versionen prüfen beim Start und anschließend alle sechs Stunden den
öffentlichen GitHub-Release-Kanal.

Beim Start zeigt ein eigenes Fenster den aktuellen Zustand an:

- Suche nach einer neuen Version
- gefundenes Update
- Download-Fortschritt in Prozent
- Installation und anschließender Neustart

Mit **Ohne Update starten** lässt sich Stillpoint jederzeit direkt öffnen. Ein
bereits begonnener Download kann im Hintergrund weiterlaufen. Sobald ein Update
bereitsteht, kann es über das Stillpoint-Symbol im Windows-Infobereich
installiert werden; spätestens beim vollständigen Beenden wird es übernommen.

## Verhalten im Windows-Infobereich

Ein Klick auf das Schließen-Symbol blendet das Hauptfenster aus. Stillpoint
bleibt für Schnellnotizen und aktivierte Erinnerungen im Windows-Infobereich
geöffnet.

Zum vollständigen Beenden:

1. Das Stillpoint-Symbol rechts unten im Windows-Infobereich öffnen.
2. **Stillpoint beenden** auswählen.

## Datenschutz und lokale Daten

- Kein Konto und keine Anmeldung
- Keine Werbung und keine Analyse- oder Trackingdienste
- Keine Übertragung von Aktivitätsdaten an einen Server
- Keine Cloud-Synchronisierung
- Notizen, Einstellungen und Fortschritt bleiben auf dem jeweiligen Gerät
- Klangräume werden lokal erzeugt und nicht gestreamt

Die Daten werden nicht automatisch zwischen mehreren Computern übertragen.
Über **Lokale Daten löschen** im Bereich „Dein Rhythmus“ kann der gespeicherte
Stand vollständig zurückgesetzt werden.

## Technischer Aufbau

- **Electron** stellt die Windows-Desktop-Anwendung, das Tray-Menü und die
  Betriebssystemintegration bereit.
- **React und TypeScript** bilden die Benutzeroberfläche und Produktlogik.
- **Vite/vinext** erzeugt die Entwicklungs- und Produktions-Bundles.
- **electron-updater** verbindet installierte Versionen mit den öffentlichen
  GitHub-Releases.
- **NSIS** erzeugt den installierbaren Windows-Installer.
- Die Desktop-Fenster verwenden Context Isolation, Sandbox und eine begrenzte
  Preload-Schnittstelle.

Wichtige Bereiche des Repositories:

- `app/components` – Oberfläche und interaktive Werkzeuge
- `app/hooks/useStillpoint.ts` – lokale Speicherung und Zustand
- `app/lib/stillpoint.ts` – geprüfte, seiteneffektfreie Produktlogik
- `desktop` – Electron-Hauptprozess, Startfenster und Desktop-Anbindung
- `tests` – Produkt-, Persistenz-, Rendering- und Desktop-Update-Tests
- `docs` – Qualitätsnachweise und Protokoll der ursprünglichen Ruflo-Nutzung

Ruflo wurde während der ursprünglichen Entwicklung als schlanke
Orchestrierungs- und Review-Schicht verwendet. Ruflo ist keine Laufzeitabhängigkeit
und wird für die installierte Anwendung nicht benötigt.

## Lokale Entwicklung

Voraussetzung ist Node.js ab Version 22.13.

```bash
npm install
npm run dev
```

`npm run dev` startet ausschließlich eine lokale Entwicklungsvorschau. Sie ist
nicht die veröffentlichte Produktversion.

Desktop-Bundle und Installer erstellen:

```bash
npm run desktop:build
npm run desktop:package
```

Der Installer entsteht unter `desktop-release/Stillpoint-Setup.exe`.

## Qualität prüfen

```bash
npm run lint
npm test
npm audit --omit=dev
```

Die Tests prüfen unter anderem Timer-Zeitgrenzen, Pausieren und Fortsetzen,
einmalige Session-Abschlüsse, lokale Persistenz, nicht verfügbaren Speicher,
Erststart-Profil, Wochenrückblick, Desktop-Funktionen und Update-Integration.

Die ursprünglichen messbaren Qualitätsziele stehen in
[`docs/QUALITY_GATES.md`](docs/QUALITY_GATES.md). Die dazugehörigen Ergebnisse
und Ruflo-Protokolle dokumentieren die erste Projektphase und sind nicht als
laufender Versions-Changelog gedacht.

## Veröffentlichung

Ein vollständiges Desktop-Release benötigt genau diese drei Dateien:

- `Stillpoint-Setup.exe`
- `Stillpoint-Setup.exe.blockmap`
- `latest.yml`

Sie werden gemeinsam unter einem stabilen Versions-Tag wie `v0.3.2`
veröffentlicht. `latest.yml` und die Blockmap sind notwendig, damit bereits
installierte Anwendungen das Update erkennen und effizient herunterladen
können.

Aktuelle Versionen befinden sich unter
[GitHub Releases](https://github.com/tayco00/stillpoint/releases/latest).
