// src/app/webhook/photo-booth/print-done/route.ts
import { NextResponse } from "next/server";
import { printQueue } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data.api_key !== "jMVxMDFg-uuGodGeOvyiKgIuCt3_1vQi87OY_LK9IKs") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const index = printQueue.findIndex(j => j.session_id === data.session_id);
    if (index !== -1) printQueue.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}