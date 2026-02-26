"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StartScreen from "@/components/StartScreen";
import RegistrationForm from "@/components/RegistrationForm";
import CameraView from "@/components/CameraView";
import ProcessingView from "@/components/ProcessingView";
import PhotoPreview from "@/components/PhotoPreview";
import ConfirmedView from "@/components/ConfirmedView";
import {
  AppStep,
  FormData,
  SessionData,
  Superpower,
} from "@/lib/types";
import { sendProcessWebhook, sendConfirmWebhook } from "@/lib/webhook";

export default function PhotoBoothApp() {
  const [step, setStep] = useState<AppStep>("start");
  const [session, setSession] = useState<SessionData>({
    email: "",
    superpower: "superhero",
    industry: "sonstige",
    privacy_accepted: false,
    session_id: "",
  });
  const [error, setError] = useState<string | null>(null);

  const generateSessionId = () =>
    `pb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleStart = () => setStep("form");

  const handleFormSubmit = (data: FormData) => {
    setSession((prev) => ({
      ...prev,
      ...data,
      session_id: generateSessionId(),
    }));
    setStep("camera");
  };

  const handleCapture = useCallback(
    async (photoBase64: string) => {
      setSession((prev) => ({ ...prev, photo: photoBase64 }));
      setStep("processing");
      setError(null);

      const currentSession = {
        ...session,
        photo: photoBase64,
        session_id: session.session_id || generateSessionId(),
      };

      try {
        const result = await sendProcessWebhook(currentSession);

        if (result.success) {
          setSession((prev) => ({
            ...prev,
            processed_photo: result.processed_photo || prev.photo,
            session_id: result.session_id || prev.session_id,
          }));
          setStep("preview");
        } else {
          setError(result.error || "Verarbeitung fehlgeschlagen");
          setSession((prev) => ({
            ...prev,
            processed_photo: prev.photo,
          }));
          setStep("preview");
        }
      } catch {
        setSession((prev) => ({
          ...prev,
          processed_photo: prev.photo,
        }));
        setStep("preview");
      }
    },
    [session]
  );

  const handleRetake = () => {
    setSession((prev) => ({
      ...prev,
      photo: undefined,
      processed_photo: undefined,
    }));
    setStep("camera");
  };

  const handleConfirm = async (printPhoto: boolean) => {
    setSession((prev) => ({ ...prev, print_photo: printPhoto }));
    setStep("confirmed");
    sendConfirmWebhook({ ...session, print_photo: printPhoto }, "confirm").catch(console.error);
  };

  const handleRestart = () => {
    setSession({
      email: "",
      superpower: "superhero",
      industry: "sonstige",
      privacy_accepted: false,
      session_id: "",
    });
    setError(null);
    setStep("start");
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === "start" && <StartScreen onStart={handleStart} />}

        {step === "form" && (
          <RegistrationForm
            onSubmit={handleFormSubmit}
            onBack={() => setStep("start")}
          />
        )}

        {step === "camera" && (
          <CameraView
            superpower={session.superpower as Superpower}
            onCapture={handleCapture}
            onBack={() => setStep("form")}
          />
        )}

        {step === "processing" && (
          <ProcessingView superpower={session.superpower as Superpower} />
        )}

        {step === "preview" && (
          <>
            <PhotoPreview
              photo={session.processed_photo || session.photo || ""}
              superpower={session.superpower as Superpower}
              onConfirm={(printPhoto) => handleConfirm(printPhoto)}
              onRetake={handleRetake}
            />
            <AnimatePresence>
              {error && (
                <motion.div
                  className="fixed bottom-4 left-4 right-4 bg-rm-warning text-rm-dark p-4 rounded-xl shadow-lg z-50 text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                >
                  <p className="font-semibold">Hinweis</p>
                  <p className="text-sm">
                    {error} – Originalfoto wird angezeigt.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {step === "confirmed" && (
          <ConfirmedView
            email={session.email}
            superpower={session.superpower as Superpower}
            printPhoto={session.print_photo ?? true}
            onRestart={handleRestart}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
