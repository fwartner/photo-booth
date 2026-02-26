import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://0.0.0.0:3000",
    "http://192.168.0.0/16:3000",
    "http://10.0.0.0/8:3000",
    "http://172.16.0.0/12:3000",
    "https://n8n.pixelandprocess.de",
    "https://localhost:3000",
    "http://localhost",
    "http://127.0.0.1",
    "tauri://localhost",
    "capacitor://localhost",
  ],
};

export default nextConfig;
