// src/app/api/print-jobs/route.ts
import { NextResponse } from "next/server";
import { printQueue } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("api_key");

  if (apiKey !== "jMVxMDFg-uuGodGeOvyiKgIuCt3_1vQi87OY_LK9IKs") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (printQueue.length > 0) {
    const job = printQueue[0];
    
    const base64Image = job.image_buffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      has_job: true,
      job: {
        session_id: job.session_id,
        image_url: imageUrl,
        copies: job.copies // NEU: Python weiß nun, wie oft es drucken muss
      }
    });
  }

  return NextResponse.json({ has_job: false });
}