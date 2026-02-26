# RecyclingMonitor – Styleguide

Dieses Dokument definiert das Design-System für alle RecyclingMonitor-Anwendungen, basierend auf der Analyse von recyclingmonitor.de.

---

## 1. Farbpalette

### Primärfarben
| Name              | Hex       | Verwendung                          |
|-------------------|-----------|-------------------------------------|
| Teal              | `#18A092` | Primärakzent, Gradient-Start, CTAs  |
| Dark Blue         | `#034C80` | Gradient-Ende, Header, Vertrauen    |
| Header Blue       | `#034C90` | Header-Hintergrund                  |
| Border Teal       | `#18A091` | Rahmen, Trennlinien                 |

### Gradient
```css
background: linear-gradient(90deg, #18A092, #034C80);
```
Der Marken-Gradient wird für Hero-Bereiche, Buttons und Akzentelemente verwendet.

### Neutrale Farben
| Name              | Hex       | Verwendung                          |
|-------------------|-----------|-------------------------------------|
| Weiß              | `#FFFFFF` | Hintergründe, Text auf Gradient     |
| Schwarz           | `#000000` | Primärtext                          |
| Dunkelgrau        | `#32373C` | Button-Hintergrund (Solid)          |
| Hellgrau          | `#F8FAFC` | Sektionshintergründe                |
| Mittelgrau        | `#64748B` | Sekundärtext, Beschreibungen        |

### Semantische Farben
| Name              | Hex       | Verwendung                          |
|-------------------|-----------|-------------------------------------|
| Erfolg            | `#18A092` | Erfolg-Status (=Teal)               |
| Fehler            | `#DC2626` | Fehlermeldungen                     |
| Warnung           | `#F59E0B` | Warnhinweise                        |
| Info              | `#034C80` | Info-Badges (=Dark Blue)            |

---

## 2. Typografie

### Schriftart
**Source Sans 3** – die primäre Schriftfamilie für alle Elemente.

```css
font-family: 'Source Sans 3', ui-sans-serif, system-ui, sans-serif;
```

Gewichte: 200 (ExtraLight), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)

### Überschriften (Responsiv)
| Element | Größe (clamp)                                     | Gewicht |
|---------|---------------------------------------------------|---------|
| H1      | `clamp(2.5rem, calc(3.3vw + 1.7rem), 5.375rem)`  | 700     |
| H2      | `clamp(2.125rem, calc(2.1vw + 1.6rem), 4rem)`     | 700     |
| H3      | `clamp(1.75rem, calc(2vw + 1.3rem), 3.5rem)`      | 600     |
| H4      | `clamp(1.375rem, calc(0.1vw + 1.3rem), 1.5rem)`   | 600     |
| H5      | `calc(1.3125rem + 0.75vw)`                         | 600     |
| H6      | `calc(1.275rem + 0.3vw)`                           | 600     |

### Fließtext
| Element     | Größe            | Zeilenhöhe | Gewicht |
|-------------|------------------|------------|---------|
| Body        | 1.5rem (Desktop) | 1.5        | 400     |
| Body klein  | 1rem             | 1.5        | 400     |
| Caption     | 0.875rem         | 1.375      | 400     |
| Label       | 0.75rem          | 1.25       | 600     |

### Buchstabenabstand
| Name    | Wert      |
|---------|-----------|
| Enger   | -0.05em   |
| Eng     | -0.025em  |
| Normal  | 0em       |
| Weit    | 0.025em   |
| Weiter  | 0.05em    |

---

## 3. Abstände (Spacing)

Basierend auf 0.25rem (4px) Raster:

| Token | Wert   | Pixel |
|-------|--------|-------|
| 1     | 0.25rem| 4px   |
| 2     | 0.5rem | 8px   |
| 3     | 0.75rem| 12px  |
| 4     | 1rem   | 16px  |
| 5     | 1.25rem| 20px  |
| 6     | 1.5rem | 24px  |
| 8     | 2rem   | 32px  |
| 10    | 2.5rem | 40px  |
| 12    | 3rem   | 48px  |
| 16    | 4rem   | 64px  |
| 20    | 5rem   | 80px  |
| 24    | 6rem   | 96px  |

---

## 4. Eckenradien (Border Radius)

| Name     | Wert    | Verwendung                    |
|----------|---------|-------------------------------|
| sm       | 0.25rem | Kleine Elemente, Inputs       |
| md       | 0.5rem  | Karten, Container             |
| lg       | 0.75rem | Große Karten                  |
| xl       | 1rem    | Modale, Feature-Karten        |
| 2xl      | 1.5rem  | Hero-Elemente                 |
| 3xl      | 2rem    | Große Container               |
| full     | 9999px  | Buttons (Pillenform), Avatare |
| button   | 50px    | CTA-Buttons                   |

---

## 5. Schatten (Box Shadows)

| Name     | Wert                                | Verwendung           |
|----------|-------------------------------------|----------------------|
| Sharp    | `6px 6px 0 rgba(0,0,0,0.2)`        | Karten mit Kante     |
| Deep     | `12px 12px 50px rgba(0,0,0,0.4)`   | Hervorgehobene Elemente |
| Natural  | `6px 6px 9px rgba(0,0,0,0.2)`      | Standard-Karten      |
| Soft     | `0 4px 6px rgba(0,0,0,0.1)`        | Subtile Erhebung     |

---

## 6. Buttons

### Primär (Solid)
```css
background: linear-gradient(90deg, #18A092, #034C80);
color: #ffffff;
border: none;
border-radius: 50px;
padding: 0.75rem 2rem;
font-weight: 600;
font-size: 1rem;
transition: all 0.3s ease;
```

### Sekundär (Outline)
```css
background: transparent;
color: #ffffff;
border: 2px solid #ffffff;
border-radius: 50px;
padding: 0.75rem 2rem;
font-weight: 600;
```

### Dunkel (Solid Dark)
```css
background: #32373C;
color: #ffffff;
border-radius: 9999px;
padding: 0.75rem 2rem;
font-weight: 600;
```

### Hover-Zustand
- Scale: `transform: scale(1.02)`
- Schatten: erhöhter Box-Shadow
- Opacity: leichte Aufhellung

---

## 7. Layout

### Container
```css
max-width: 1231px; /* Standard */
margin: 0 auto;
padding: 0 1.5rem;
```

### Breakpoints
| Name | Breite   |
|------|----------|
| xs   | 30rem    |
| sm   | 40rem    |
| md   | 48rem    |
| lg   | 64rem    |
| xl   | 80rem    |
| 2xl  | 100rem   |
| 3xl  | 120rem   |

### Grid-System
- Flexbox-basiert mit Gap-Utilities
- Mobile: 1 Spalte
- Tablet: 2 Spalten
- Desktop: 3–4 Spalten

---

## 8. Animationen & Übergänge

### Standard-Übergang
```css
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
```

### Slide-Animationen
```css
@keyframes slideToTop {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-100%); opacity: 0; }
}
@keyframes slideFromTop {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
Dauer: 0.4s ease

### Scroll-basierte Header-Animation
Header blendet beim Herunterscrollen aus und beim Hochscrollen wieder ein (Toleranz-basiert).

---

## 9. Ikonografie

- **Icon-Set:** Font Awesome (SVG-Format)
- **Größe:** 40px Standard
- **Farbe:** Erbt von Parent oder Gradient
- **Eigene SVG-Illustrationen** für Service-Karten

---

## 10. Designprinzipien

1. **Klarheit** – Saubere Typografie, viel Weißraum
2. **Vertrauen** – Professionelle Farbgebung (Teal → Blau = Nachhaltigkeit + Kompetenz)
3. **Zugänglichkeit** – Responsive Schriftgrößen, ausreichender Kontrast
4. **Konsistenz** – Einheitliches Spacing-Raster, wiederkehrende Komponenten
5. **Bewegung** – Subtile Animationen für Engagement, nie ablenkend
