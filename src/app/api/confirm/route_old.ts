// src/app/api/confirm/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { printQueue } from "@/lib/store"; // Unser neuer Zwischenspeicher

export async function POST(request: Request) {
  try {
    // 1. Alle Daten aus dem Formular holen
    const formData = await request.formData();
    const action = formData.get("action");
    const email = formData.get("email") as string | null;
    const photoBlob = formData.get("photo") as Blob | null;
    
    // Daten für den Druck holen
    const printPhoto = formData.get("print_photo") === "true";
    const sessionId = formData.get("session_id") as string || "test-session";
    const superpower = formData.get("heldentyp") as string || "Held";

    // 2. Prüfen, ob ein Foto mitgeschickt wurde
    if (photoBlob) {
      // Das Foto in ein lesbares Format (Buffer) umwandeln
      const arrayBuffer = await photoBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // --- HIER PASSIERT DIE MAGIE FÜR DEN DRUCKER ---
      if (printPhoto) {
        printQueue.push({
          session_id: sessionId,
          superpower: superpower,
          image_buffer: buffer,
        });
        console.log(`Foto zur Druck-Warteschlange hinzugefügt! (Session: ${sessionId})`);
      }

      // --- HIER PASSIERT DER E-MAIL-VERSAND ---
      if (email) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        const emailHtml = `
  <div style="font-family: sans-serif; line-height: 1.5; color: #000; max-width: 600px; margin: 0; padding: 20px;">
    <p>Liebe Heldin, lieber Held der Kreislaufwirtschaft,</p>

    <p>dein persönliches Superkraft-Bild findest du im Anhang</p>

    <p><strong>Jetzt die entscheidende Frage:</strong><br>
    Wie setzt du deine Superkräfte im Alltag ein?</p>

    <p>Der RecyclingMonitor gibt dir die Werkzeuge dafür – für mehr Transparenz, bessere Prozesse und echte Wirkung.</p>

    <p>Schau vorbei und entdecke mehr:<br>
    <a href="https://www.recyclingmonitor.de" style="color: #000; text-decoration: underline;">www.recyclingmonitor.de</a></p>

    <p>Viel Spaß mit deinem Bild – und bis bald!</p>

    <p style="margin-top: 30px;">Dein Rémon-Team</p>
  </div>
`;
        await transporter.sendMail({
          from: `"Foto-Box" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Deine Superkraft wartet im Anhang",
          html: emailHtml,
          attachments: [
            {
              filename: "foto.png",
              content: buffer,
              contentType: "image/png",
            },
          ],
        });
        console.log(`E-Mail gesendet an: ${email}`);
      }
    }

    // 3. Erfolgsmeldung an die App zurückgeben
    return NextResponse.json({
      success: true,
      action: action === "retake" ? "retake" : "confirmed",
      message: "Erfolgreich verarbeitet.",
    });

  } catch (error) {
    console.error("Fehler in der Confirm-Route:", error);
    return NextResponse.json(
      { success: false, action: "retake", message: "Fehler aufgetreten." },
      { status: 500 }
    );
  }
}