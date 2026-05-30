import requests
import time
import os
import subprocess

# --- KONFIGURATION ---
N8N_URL = "http://localhost:3000"  
PRINTER_NAME = "Canon_SELPHY_CP1300" 
API_KEY = "jMVxMDFg-uuGodGeOvyiKgIuCt3_1vQi87OY_LK9IKs"
POLL_INTERVAL = 5  

def print_image(file_path):
    print(f"[DRUCKER] Sende Foto direkt an {PRINTER_NAME}...")
    
    # 1. Drucker zwingend "aufwecken", falls macOS ihn pausiert hat!
    subprocess.run(["cupsenable", PRINTER_NAME], capture_output=True)
    
    # 2. Alte hängende Jobs sicherheitshalber löschen
    subprocess.run(["cancel", "-a", PRINTER_NAME], capture_output=True)

    # 3. Das direkte PNG an den Drucker schicken (mit deinen perfekten Layout-Settings)
    cmd = [
        "lp",
        "-d", PRINTER_NAME,
        "-o", "media=Postcard.Fullbleed",
        "-o", "fit-to-page",
        "-o", "orientation-requested=4", # Querformat
        file_path
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("Bild erfolgreich an Drucker gesendet!")
        return True
    except Exception as e:
        print(f"[FEHLER] Druckbefehl: {e}")
        return False

def process_job(job):
    session_id = job['session_id']
    image_url = job['image_url']
    print(f"[JOB] Verarbeite Session: {session_id}")
    
    try:
        # Nur das Bild laden (Wir sparen uns die weasyprint PDF Generierung!)
        img_data = requests.get(image_url).content
        img_path = f"temp_{session_id}.png"
        
        with open(img_path, 'wb') as f:
            f.write(img_data)

        # DIREKT DRUCKEN
        if print_image(img_path):
            requests.post(f"{N8N_URL}/webhook/photo-booth/print-done", json={
                "api_key": API_KEY,
                "session_id": session_id
            })
            print(f"[ERFOLG] Druckauftrag gesendet.")
        
        # Aufräumen
        if os.path.exists(img_path): os.remove(img_path)

    except Exception as e:
        print(f"[FEHLER] Job-Verarbeitung: {e}")

def main():
    print(f"--- Photo Booth Print Agent (Direct PNG Mode) ---")
    while True:
        try:
            response = requests.get(f"{N8N_URL}/webhook/photo-booth/print-jobs", params={"api_key": API_KEY})
            if response.status_code == 200:
                data = response.json()
                if data.get('has_job'):
                    process_job(data['job'])
        except Exception:
            pass
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()