import requests
import time
import os
import subprocess
from weasyprint import HTML

# --- KONFIGURATION ---
N8N_URL = "http://localhost:3000"  
PRINTER_NAME = "Canon_SELPHY_CP1300" 
API_KEY = "jMVxMDFg-uuGodGeOvyiKgIuCt3_1vQi87OY_LK9IKs"
POLL_INTERVAL = 5  

def print_image(file_path):
    print(f"[DRUCKER] Sende {file_path} an {PRINTER_NAME}...")
    
    # Zuerst alle alten/hängenden Jobs löschen, um Stau zu vermeiden
    subprocess.run(["cancel", "-a", PRINTER_NAME])

    # lp-Optionen, um die Einstellungen aus deinem Vorschau-Foto (Bild 4) nachzuahmen:
    # 1. orientation-requested=4 -> Zwingt das Querformat (Landscape)
    # 2. fit-to-page -> Skaliert das Bild auf die volle Seite (Borderless)
    cmd = [
        "lp",
        "-d", PRINTER_NAME,
        "-o", "orientation-requested=4", # 4 = Landscape (Querformat)
        "-o", "fit-to-page",
        file_path
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("Druckauftrag erfolgreich übergeben (Landscape Native)!")
        return True
    except Exception as e:
        print(f"[FEHLER] Druckbefehl fehlgeschlagen: {e}")
        return False

def process_job(job):
    """Lädt das Bild, erstellt ein natives Querformat-PDF und druckt es."""
    session_id = job['session_id']
    image_url = job['image_url']
    print(f"[JOB] Verarbeite Session: {session_id}")
    
    try:
        # Bild laden
        img_data = requests.get(image_url).content
        img_path = f"temp_{session_id}.png"
        pdf_path = f"print_{session_id}.pdf"
        
        with open(img_path, 'wb') as f:
            f.write(img_data)

        # --- DAS NATIVE QUERFORMAT-PDF ---
        # Wir erstellen das Dokument nativ in 148mm Breite x 100mm Höhe (Landscape).
        # Wir zentrieren das Bild und füllen die Fläche aus ("object-fit: cover").
        html_content = f"""
        <html>
            <style>
                @page {{ 
                    size: 148mm 100mm;  /* Nativ Landscape PDF */
                    margin: 0; 
                }}
                body {{ 
                    margin: 0; padding: 0; 
                    width: 148mm; height: 100mm;
                    display: flex; justify-content: center; align-items: center;
                    background-color: white;
                    overflow: hidden;
                }}
                img {{ 
                    width: 100%; height: 100%;
                    object-fit: cover; /* Füllt das Papier komplett aus */
                }}
            </style>
            <body>
                <img src="file://{os.path.abspath(img_path)}">
            </body>
        </html>
        """
        HTML(string=html_content).write_pdf(pdf_path)

        if print_image(pdf_path):
            requests.post(f"{N8N_URL}/webhook/photo-booth/print-done", json={
                "api_key": API_KEY,
                "session_id": session_id
            })
            print(f"[ERFOLG] Druckauftrag gesendet.")
        
        # Aufräumen der temporären Dateien
        if os.path.exists(img_path): os.remove(img_path)
        if os.path.exists(pdf_path): os.remove(pdf_path)
    except Exception as e:
        print(f"[FEHLER] Job-Verarbeitung fehlgeschlagen: {e}")

def main():
    print(f"--- Photo Booth Print Agent (Landscape Native Fix) läuft ---")
    while True:
        try:
            response = requests.get(f"{N8N_URL}/webhook/photo-booth/print-jobs", params={"api_key": API_KEY})
            if response.status_code == 200:
                data = response.json()
                if data.get('has_job'):
                    process_job(data['job'])
        except Exception as e:
            print(f"[FEHLER] Verbindung: {e}")
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()