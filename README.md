# Holland-Turnier Organisator

Eine React-Anwendung zur Organisation von Holland-Turnieren im Jugendfußball. Die App ermöglicht die Verwaltung von Spielern, die Konfiguration verschiedener Spielformate und die automatische Generierung fairer Spielpaarungen.

## Features

- **Spielerverwaltung**: Hinzufügen, aktivieren/deaktivieren von Spielern
- **Turnierkonfiguration**: Verschiedene Spielformate (2vs2, 3vs3, 4+1vs4+1)
- **Faire Teamverteilung**: Intelligenter Algorithmus basierend auf Punktestand
- **Ergebniseingabe**: Einfache Eingabe von Spielergebnissen
- **Rangliste**: Automatische Punkteberechnung und Ranking
- **Lokale Datenspeicherung**: Alle Daten werden im Browser gespeichert

## Technologie-Stack

- **React 19** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **shadcn/ui** für UI-Komponenten
- **Lucide React** für Icons
- **localStorage** für Datenpersistierung

## Installation & Entwicklung

```bash
# Abhängigkeiten installieren
pnpm install

# Entwicklungsserver starten
pnpm run dev

# Für Produktion bauen
pnpm run build

# Build vorschau
pnpm run preview
```

## Deployment

Diese App ist für das Deployment auf [Render.com](https://render.com) konfiguriert:

1. Repository zu GitHub hochladen
2. Neuen Static Site Service auf Render erstellen
3. Repository verbinden
4. Automatisches Deployment erfolgt bei Git-Push

## Projektstruktur

```
src/
├── components/          # React-Komponenten
│   ├── ui/             # shadcn/ui Komponenten
│   ├── Players.tsx     # Spielerverwaltung
│   ├── Tournament.tsx  # Turnierkonfiguration
│   ├── Games.tsx       # Spielverwaltung
│   └── Leaderboard.tsx # Rangliste
├── contexts/           # React Context für State Management
├── types/              # TypeScript Typen
└── lib/                # Utility-Funktionen
```

## Nutzung

1. **Spieler hinzufügen**: Füge Spieler mit Namen und Trikotnummer hinzu
2. **Turnier konfigurieren**: Wähle Spielformate und Anzahl der Spiele
3. **Turnier starten**: Generiere automatisch faire Teamverteilungen
4. **Ergebnisse eingeben**: Trage Spielergebnisse ein
5. **Rangliste verfolgen**: Verfolge Punkte und Statistiken

## Punktesystem

- **Sieg**: 5 Punkte
- **Unentschieden**: 2 Punkte  
- **Tor**: 1 Punkt pro erzieltem Tor

## Lizenz

MIT License 
