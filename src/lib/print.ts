// src/lib/store.ts
type PrintJob = {
  session_id: string;
  superpower: string;
  image_buffer: Buffer;
};

// Wir nutzen globalThis, was in Next.js stabiler ist
const globalTarget = globalThis as unknown as { 
  printQueue: PrintJob[] 
};

if (!globalTarget.printQueue) {
  globalTarget.printQueue = [];
}

export const printQueue = globalTarget.printQueue;