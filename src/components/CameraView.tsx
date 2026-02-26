"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, ArrowLeft } from "lucide-react";
import { Superpower, SUPERPOWERS } from "@/lib/types";

interface Props {
  superpower: Superpower;
  onCapture: (photoBase64: string) => void;
  onBack: () => void;
}

export default function CameraView({ superpower, onCapture, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const sp = SUPERPOWERS[superpower];

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);
    setReady(false);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setReady(true);
        };
      }
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen."
          : err instanceof DOMException && err.name === "NotFoundError"
          ? "Keine Kamera gefunden. Bitte schließe eine Kamera an."
          : "Kamera konnte nicht gestartet werden. Bitte versuche es erneut.";
      setCameraError(msg);
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    setFlash(true);
    setTimeout(() => setFlash(false), 500);

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    stopStream();

    setTimeout(() => {
      onCapture(dataUrl);
    }, 600);
  }, [onCapture, stopStream]);

  const startCountdown = useCallback(() => {
    if (countdown !== null || !ready) return;

    setCountdown(5);
    let count = 5;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [countdown, ready, capturePhoto]);

  const handleBack = useCallback(() => {
    stopStream();
    onBack();
  }, [stopStream, onBack]);

  return (
    <div className="rm-full-height bg-rm-dark flex flex-col">
      {/* Nav */}
      <nav className="rm-nav flex items-center justify-between relative z-20">
        <button
          onClick={handleBack}
          className="rm-btn-ghost text-white/80 hover:text-white flex items-center gap-1.5 text-sm rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Zurück</span>
        </button>
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-lg md:text-xl">{sp.icon}</span>
          <span className="text-white font-semibold text-xs md:text-sm">{sp.label}</span>
        </div>
        <div className="w-10 sm:w-20" />
      </nav>

      {/* Step indicator */}
      <div className="bg-rm-dark border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-2 md:py-3 flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <span className="flex items-center gap-1 md:gap-1.5 text-white/40">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-teal text-white flex items-center justify-center text-[10px] md:text-xs font-bold">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            Daten
          </span>
          <span className="flex-1 h-px bg-white/20 max-w-8" />
          <span className="flex items-center gap-1 md:gap-1.5 text-rm-teal font-semibold">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-teal text-white flex items-center justify-center text-[10px] md:text-xs font-bold">2</span>
            Foto
          </span>
          <span className="flex-1 h-px bg-white/20 max-w-8" />
          <span className="flex items-center gap-1 md:gap-1.5 text-white/40">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-[10px] md:text-xs font-bold">3</span>
            Ergebnis
          </span>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 flex items-center justify-center relative">
        {cameraError ? (
          <div className="text-center p-6 md:p-8 max-w-sm md:max-w-md">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Camera className="w-8 h-8 md:w-10 md:h-10 text-white/30" />
            </div>
            <p className="text-white/80 text-sm md:text-lg mb-4 md:mb-6 leading-relaxed">{cameraError}</p>
            <button onClick={startCamera} className="rm-btn rm-btn-outline">
              <RotateCcw className="w-4 h-4" />
              Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-rm-dark z-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-rm-teal rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/50 text-sm font-medium">
                    Kamera wird gestartet...
                  </p>
                </div>
              </div>
            )}

            {/* Corner frame */}
            <div className="absolute inset-6 md:inset-12 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-xl" />
            </div>

            {/* Guide text */}
            <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
              <span className="text-white/60 text-sm font-medium bg-black/40 backdrop-blur-sm inline-block px-5 py-2 rounded-full">
                Positioniere dich in der Mitte
              </span>
            </div>
          </>
        )}

        {/* Countdown */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                key={countdown}
                className="text-white font-bold tabular-nums text-[6rem] md:text-[10rem]"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash */}
        <AnimatePresence>
          {flash && (
            <motion.div
              className="absolute inset-0 bg-white z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Capture button */}
      <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center z-20 rm-safe-bottom">
        <motion.button
          onClick={startCountdown}
          disabled={countdown !== null || !!cameraError || !ready}
          className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-sm border-[3px] border-white/80 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={ready ? { scale: 1.08 } : {}}
          whileTap={ready ? { scale: 0.92 } : {}}
        >
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <Camera className="w-6 h-6 text-rm-dark" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
