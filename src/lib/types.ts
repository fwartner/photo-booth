export type Superpower = "superhero" | "time_traveler" | "fantasy";

export type Industry =
  | "entsorger"
  | "wertstoffhof"
  | "abfallerzeuger"
  | "kommune"
  | "industrie"
  | "sonstige";

export type AppStep =
  | "start"
  | "form"
  | "camera"
  | "processing"
  | "preview"
  | "confirmed";

export interface FormData {
  email: string;
  superpower: Superpower;
  industry: Industry;
  privacy_accepted: boolean;
}

export interface SessionData extends FormData {
  session_id: string;
  photo?: string; // base64
  processed_photo?: string; // base64 from webhook response
  pipedrive_person_id?: string;
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

export const SUPERPOWERS: Record<
  Superpower,
  { label: string; description: string; icon: string; color: string }
> = {
  superhero: {
    label: "Superheld",
    description: "Verwandle dich in einen epischen Superhelden mit Umhang und Superkräften!",
    icon: "⚡",
    color: "#DC2626",
  },
  time_traveler: {
    label: "Zeitreisender",
    description: "Reise durch die Zeit mit Steampunk-Brille und Zeitvortex!",
    icon: "⏳",
    color: "#8B5CF6",
  },
  fantasy: {
    label: "Fantasy-Magier",
    description: "Werde ein mächtiger Zauberer mit magischen Kräften und Zauberstab!",
    icon: "✨",
    color: "#2563EB",
  },
};

export const INDUSTRIES: Record<Industry, string> = {
  entsorger: "Entsorger / Recycler / Containerdienst",
  wertstoffhof: "Wertstoffhofbetreiber",
  abfallerzeuger: "Abfallerzeuger",
  kommune: "Kommune / Öffentliche Hand",
  industrie: "Industrie / Gewerbe",
  sonstige: "Sonstige",
};
