export type Heldentyp =
  | "transparenz_scout"
  | "effizienz_architekt"
  | "impact_maker"
  | "smarter_entscheider";

export type Kategorie =
  | "entsorger"
  | "erzeuger"
  | "wertstoffhof"
  | "technologieanbieter";

export type Stilmodus = "comic" | "extreme";

export type AppStep =
  | "start"
  | "form"
  | "camera"
  | "processing"
  | "preview"
  | "contact"
  | "confirmed";

export interface FormData {
  heldentyp: Heldentyp;
  kategorie: Kategorie;
  mode: Stilmodus;
  personenanzahl: number;
  firmenname?: string;
}

export interface SessionData {
  heldentyp: Heldentyp;
  kategorie: Kategorie;
  mode: Stilmodus;
  personenanzahl: number;
  firmenname?: string;
  email?: string;
  privacy_accepted: boolean;
  session_id: string;
  photo?: string;
  processed_photo?: string;
  print_photo?: boolean;
}

export interface WebhookProcessResponse {
  success: boolean;
  error?: string;
  session_id?: string;
}

export interface WebhookConfirmResponse {
  success: boolean;
  action: "confirmed" | "retake";
  message: string;
  email?: string;
}

export const HELDENTYPEN: Record<
  Heldentyp,
  { label: string; description: string; icon: string; color: string; thema: string }
> = {
  transparenz_scout: {
    label: "Transparenz-Scout",
    description: "Stoffstromtransparenz, Analyse & Nachverfolgbarkeit",
    icon: "🔍",
    color: "#18A092",
    thema: "Daten-HUD, Analyse-Overlays, Materialfluss-Visualisierung",
  },
  effizienz_architekt: {
    label: "Effizienz-Architekt",
    description: "Prozessoptimierung & Automatisierung",
    icon: "⚡",
    color: "#F59E0B",
    thema: "Energie-Linien, industrielle Dynamik, Flow-Elemente",
  },
  impact_maker: {
    label: "Impact-Maker",
    description: "Nachhaltigkeit, CO₂-Reduktion & Kreislaufwirtschaft",
    icon: "🌱",
    color: "#22C55E",
    thema: "Kreislauf-Symbole, grüne Energie, Industrie + Natur",
  },
  smarter_entscheider: {
    label: "Smarter Entscheider",
    description: "Strategie, KPI & datenbasierte Führung",
    icon: "📊",
    color: "#6366F1",
    thema: "Holografische Dashboards, strategische Präsenz",
  },
};

export const KATEGORIEN: Record<Kategorie, string> = {
  entsorger: "Entsorger / Recycler",
  erzeuger: "Erzeuger / Produzent",
  wertstoffhof: "Wertstoffhofbetreiber",
  technologieanbieter: "Technologieanbieter",
};

// Legacy aliases for backward compatibility
export type Superpower = Heldentyp;
export type Industry = Kategorie;
export const SUPERPOWERS = HELDENTYPEN;
export const INDUSTRIES = KATEGORIEN;
