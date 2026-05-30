// src/lib/store.ts
export interface PrintJob {
  session_id: string;
  superpower: string;
  image_buffer: Buffer;
  copies: number; // NEU: Speichert die Anzahl der gewünschten Ausdrucke
}

export const printQueue: PrintJob[] = [];