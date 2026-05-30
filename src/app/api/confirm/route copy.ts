// src/app/api/confirm/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { printQueue } from "@/lib/store";
import sharp from "sharp"; 
import path from "path";   

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    const email = formData.get("email") as string | null;
    const photoBlob = formData.get("photo") as Blob | null;
    
    const printPhoto = formData.get("print_photo") === "true";
    const sessionId = formData.get("session_id") as string || "test-session";
    const superpower = formData.get("heldentyp") as string || "Held";

    if (photoBlob) {
      const arrayBuffer = await photoBlob.arrayBuffer();
      const originalBuffer = Buffer.from(arrayBuffer);

      // --- 1. PFAde ZU DEN LOGOS ---
      const remonLogoPath = path.join(process.cwd(), "public", "remon-logo.png");
      const ifatLogoPath = path.join(process.cwd(), "public", "ifat-logo.png");

      // --- 2. MAßE DES FOTOS AUSLESEN ---
      const imageMetadata = await sharp(originalBuffer).metadata();
      const imageWidth = imageMetadata.width || 1200; 

      // --- 3. LOGOS SKALIEREN (25% der Bildbreite) ---
      const desiredLogoWidth = Math.round(imageWidth * 0.25);
      
      const ifatLogoBuffer = await sharp(ifatLogoPath)
        .resize({ width: desiredLogoWidth, fit: 'inside' })
        .toBuffer();

      const remonLogoBuffer = await sharp(remonLogoPath)
        .resize({ width: desiredLogoWidth, fit: 'inside' })
        .toBuffer();

      // Wir brauchen die exakte finale Breite des rechten Logos für die Platzierung
      const remonMeta = await sharp(remonLogoBuffer).metadata();
      const remonActualWidth = remonMeta.width || desiredLogoWidth;

      // --- 4. POSITIONIERUNG BERECHNEN ---
      const topMargin = 40;  // Abstand von oben
      const sideMargin = 40; // Abstand von den Seiten

      // --- 5. LOGOS ÜBER DAS BILD LEGEN ---
      const brandedBuffer = await sharp(originalBuffer)
        .composite([
          {
            input: ifatLogoBuffer,
            top: topMargin,
            left: sideMargin, // Ifat-Logo: Oben Links
          },
          {
            input: remonLogoBuffer,
            top: topMargin,
            left: imageWidth - remonActualWidth - sideMargin, // Remon-Logo: Oben Rechts
          },
        ])
        .png()
        .toBuffer();

      // --- WARTESCHLANGE & E-MAIL ---
      if (printPhoto) {
        printQueue.push({
          session_id: sessionId,
          superpower: superpower,
          image_buffer: brandedBuffer, // Bild mit beiden Logos senden!
        });
      }

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
          from: `"Foto-Box Team" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Deine Superkraft wartet im Anhang",
          html: emailHtml,
          attachments: [
            {
              filename: "superhelden-foto.png",
              content: brandedBuffer, 
              contentType: "image/png",
            },
          ],
        });
      }
    }

    return NextResponse.json({ success: true, action: action === "retake" ? "retake" : "confirmed" });

  } catch (error) {
    console.error("Fehler bei der Logo-Verarbeitung:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}