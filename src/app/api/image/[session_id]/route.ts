// src/app/api/image/[session_id]/route.ts
import { NextResponse } from "next/server";
import { printQueue } from "@/lib/store";

// WICHTIG: Das params-Objekt muss als Promise behandelt werden
export async function GET(request: Request, { params }: { params: Promise<{ session_id: string }> }) {
  
  // HIER IST DER FIX: Du musst auf die params warten (await)
  const { session_id } = await params; 
  
  console.log("--- DOWNLOAD VERSUCH ---");
  console.log("Gesuchte ID:", session_id);

  const job = printQueue.find(j => j.session_id === session_id);
  
  if (!job) {
    console.error("JOB NICHT GEFUNDEN in Queue:", printQueue.map(j => j.session_id));
    return new NextResponse("Not found", { status: 404 });
  }

  console.log("Job gefunden, sende Bild an Drucker...");
  return new NextResponse(job.image_buffer, {
    headers: { "Content-Type": "image/png" }
  });
}