import { SessionData, WebhookConfirmResponse } from "./types";

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || "http://localhost:5678";
const PROCESS_WEBHOOK = `${N8N_BASE_URL}/webhook/photo-booth/process`;
const CONFIRM_WEBHOOK = `${N8N_BASE_URL}/webhook/photo-booth/confirm`;

export async function sendProcessWebhook(
  data: SessionData
): Promise<{ success: boolean; session_id?: string; processed_photo?: string; error?: string }> {
  try {
    const formData = new FormData();

    formData.append("email", data.email);
    formData.append("superpower", data.superpower);
    formData.append("industry", data.industry);
    formData.append("privacy_accepted", String(data.privacy_accepted));
    formData.append("session_id", data.session_id);

    // Convert base64 photo to blob and append
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

    // Check if response is binary (processed image) or JSON
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("image") || contentType?.includes("octet-stream")) {
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      const sessionId = response.headers.get("X-Session-ID") || data.session_id;
      return { success: true, session_id: sessionId, processed_photo: base64 };
    }

    const result = await response.json();
    return { success: true, session_id: result.session_id || data.session_id };
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
    const response = await fetch(CONFIRM_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        email: data.email,
        session_id: data.session_id,
        superpower: data.superpower,
        industry: data.industry,
        photo_url: data.processed_photo ? "embedded" : undefined,
        pipedrive_person_id: data.pipedrive_person_id,
        print_photo: data.print_photo ?? true,
      }),
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
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
