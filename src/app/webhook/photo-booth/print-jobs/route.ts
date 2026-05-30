// src/app/webhook/photo-booth/print-jobs/route.ts
import { NextResponse } from "next/server";
import { printQueue } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("api_key");

  if (apiKey !== "jMVxMDFg-uuGodGeOvyiKgIuCt3_1vQi87OY_LK9IKs") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (printQueue.length > 0) {
    const job = printQueue[0];
    return NextResponse.json({
      has_job: true,
      pending_count: printQueue.length,
      job: {
        session_id: job.session_id,
        superpower: job.superpower,
        // Eigene URL zum Herunterladen des Bildes
        image_url: `${url.origin}/api/image/${job.session_id}`
      }
    });
  }

  return NextResponse.json({ has_job: false });
}