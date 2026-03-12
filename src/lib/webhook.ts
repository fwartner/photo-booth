import { SessionData, WebhookConfirmResponse } from "./types";

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || "http://localhost:5678";
const PROCESS_WEBHOOK = `${N8N_BASE_URL}/webhook/photo-booth/process`;
const CONFIRM_WEBHOOK = `${N8N_BASE_URL}/webhook/photo-booth/confirm`;

/**
 * Send photo for AI processing via n8n.
 * Sends the full parameter structure per spec:
 * { heldentyp, kategorie, mode, personenanzahl, firmenname }
 */
export async function sendProcessWebhook(
  data: SessionData
): Promise<{ success: boolean; session_id?: string; processed_photo?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("heldentyp", data.heldentyp);
    formData.append("kategorie", data.kategorie);
    formData.append("mode", data.mode);
    formData.append("personenanzahl", String(data.personenanzahl));
    formData.append("session_id", data.session_id);
    formData.append("email", data.email);
    formData.append("privacy_accepted", String(data.privacy_accepted));

    if (data.firmenname) {
      formData.append("firmenname", data.firmenname);
    }

    if (data.photo) {
      const photoBlob = base64ToBlob(data.photo, "image/png");
      formData.append("photo", photoBlob, "photo.png");
    }

    const response = await fetch(PROCESS_WEBHOOK, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.error || `Fehler: ${response.status}`,
      };
    }

    const responseText = await response.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = { success: true };
    }

    return {
      success: result.success ?? true,
      session_id: result.session_id || data.session_id,
      processed_photo: result.processed_photo,
      error: result.error,
    };
  } catch (error) {
    console.error("Webhook-Fehler:", error);
    return {
      success: false,
      error: "Verbindung zum Server fehlgeschlagen. Bitte versuche es erneut.",
    };
  }
}

export async function sendConfirmWebhook(
  data: SessionData,
  action: "confirm" | "retake"
): Promise<WebhookConfirmResponse> {
  try {
    const formData = new FormData();
    formData.append("action", action);
    formData.append("email", data.email);
    formData.append("session_id", data.session_id);
    formData.append("heldentyp", data.heldentyp);
    formData.append("kategorie", data.kategorie);
    formData.append("mode", data.mode);
    formData.append("personenanzahl", String(data.personenanzahl));
    formData.append("print_photo", String(data.print_photo ?? true));

    if (data.firmenname) {
      formData.append("firmenname", data.firmenname);
    }

    if (data.processed_photo) {
      const photoBlob = base64ToBlob(data.processed_photo, "image/png");
      formData.append("photo", photoBlob, "processed_photo.png");
    }

    const response = await fetch(CONFIRM_WEBHOOK, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return {
        success: false,
        action: "retake",
        message: "Fehler beim Bestätigen. Bitte versuche es erneut.",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Bestätigungs-Fehler:", error);
    return {
      success: false,
      action: "retake",
      message: "Verbindungsfehler. Bitte versuche es erneut.",
    };
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
