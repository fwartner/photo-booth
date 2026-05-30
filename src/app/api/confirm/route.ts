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
    
    // NEU: Anzahl der Kopien auslesen
    const copies = parseInt(formData.get("copies") as string) || 1;

    if (photoBlob) {
      const arrayBuffer = await photoBlob.arrayBuffer();
      const originalBuffer = Buffer.from(arrayBuffer);

      const remonLogoPath = path.join(process.cwd(), "public", "remon-logo.png");
      const ifatLogoPath = path.join(process.cwd(), "public", "ifat-logo.png");

      const imageMetadata = await sharp(originalBuffer).metadata();
      const imageWidth = imageMetadata.width || 1200; 
      const imageHeight = imageMetadata.height || 800;

      // Logos verkleinern (15% der Bildbreite)
      const desiredLogoWidth = Math.round(imageWidth * 0.15);
      
      const ifatLogoBuffer = await sharp(ifatLogoPath).resize({ width: desiredLogoWidth }).toBuffer();
      const remonLogoBuffer = await sharp(remonLogoPath).resize({ width: desiredLogoWidth }).toBuffer();

      const remonMeta = await sharp(remonLogoBuffer).metadata();
      const remonActualWidth = remonMeta.width || desiredLogoWidth;

      const sideMargin = 40;
      const ifatTopMargin = Math.round(imageHeight * 0.82);  // Ifat 1 cm nach unten
      const remonTopMargin = Math.round(imageHeight * 0.8); 

      const brandedBuffer = await sharp(originalBuffer)
        .composite([
          { input: ifatLogoBuffer, top: ifatTopMargin, left: sideMargin },
          { input: remonLogoBuffer, top: remonTopMargin, left: imageWidth - remonActualWidth - sideMargin },
        ])
        .png().toBuffer();

      if (printPhoto) {
        printQueue.push({
          session_id: sessionId,
          superpower: superpower,
          image_buffer: brandedBuffer,
          copies: copies, // ÜBERGABE: Anzahl der Kopien in die Queue
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
          from: `"RecyclingMonitor Foto-Box" <${process.env.SMTP_USER}>`,
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}