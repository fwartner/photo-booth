"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, ArrowRight, Printer, Copy } from "lucide-react";

export interface ContactData {
  email: string;
  privacy_accepted: boolean;
  print_photo: boolean;
  copies: number;
}

interface Props {
  onSubmit: (data: ContactData) => void;
}

export default function ContactForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [printPhoto, setPrintPhoto] = useState(true);
  const [copies, setCopies] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (email && !validateEmail(email))
      newErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein";
    if (!privacyAccepted)
      newErrors.privacy = "Bitte akzeptiere die Datenschutzerklärung";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        email,
        privacy_accepted: privacyAccepted,
        print_photo: printPhoto,
        copies: printPhoto ? copies : 0,
      });
    }
  };

  return (
    <div className="pb-full-h flex flex-col pb-gradient-bg">
      <nav className="pb-nav flex items-center justify-center">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-5 brightness-0 invert opacity-80" />
      </nav>

      <div className="bg-pb-charcoal/50 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-pb-teal text-white flex items-center justify-center text-[10px] font-bold">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            <span className="pb-label text-pb-sand-dim/40">Foto</span>
          </span>
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-pb-teal text-white flex items-center justify-center text-[10px] font-bold">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            <span className="pb-label text-pb-sand-dim/40">Ergebnis</span>
          </span>
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-pb-teal to-pb-blue text-white flex items-center justify-center text-[10px] font-bold" style={{ fontFamily: "var(--font-mono)" }}>03</span>
            <span className="pb-label text-pb-teal">Kontakt</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="pb-display-md text-pb-white mb-2">Fast geschafft!</h2>
            <p className="pb-body-lg text-pb-sand-dim/70 mb-8 md:mb-10">
              Optional: Gib deine E-Mail ein, um dein Superhelden-Foto auch digital zu erhalten.
            </p>
          </motion.div>

          <motion.div className="mb-6 md:mb-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <label className="pb-label text-pb-sand-dim block mb-2">
              E-Mail-Adresse <span className="text-pb-sand-dim/40">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pb-sand-dim/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                }}
                placeholder="deine@email.de"
                className={`pb-input pl-10 ${errors.email ? "pb-input-error" : ""}`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-pb-error text-xs mt-1.5 font-medium">
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div className="mb-6 md:mb-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <button
              type="button"
              onClick={() => setPrintPhoto(!printPhoto)}
              className={`flex items-center gap-3 w-full p-3.5 md:p-4 rounded-xl transition-all duration-200 border ${printPhoto ? "bg-pb-teal/5 border-pb-teal/25" : "bg-pb-charcoal border-white/6"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${printPhoto ? "bg-pb-teal/15" : "bg-white/5"}`}>
                <Printer className={`w-5 h-5 ${printPhoto ? "text-pb-teal" : "text-pb-sand-dim/40"}`} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-semibold text-sm ${printPhoto ? "text-pb-sand" : "text-pb-sand-dim"}`}>Foto drucken</p>
                <p className="text-pb-sand-dim/50 text-xs">{printPhoto ? "Wird vor Ort ausgedruckt" : "Nur per E-Mail"}</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${printPhoto ? "bg-pb-teal" : "bg-pb-steel"}`}>
                <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm" animate={{ left: printPhoto ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </div>
            </button>

            <AnimatePresence>
              {printPhoto && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                  <div className="relative">
                    <Copy className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pb-sand-dim/40" />
                    <select
                      value={copies}
                      onChange={(e) => setCopies(Number(e.target.value))}
                      className="pb-input pl-10 appearance-none bg-pb-charcoal/50 text-sm w-full border border-white/10"
                    >
                      <option value={1}>1x Ausdrucken (Für mich)</option>
                      <option value={2}>2x Ausdrucken (Pärchen)</option>
                      <option value={3}>3x Ausdrucken (Gruppe)</option>
                      <option value={4}>4x Ausdrucken (Große Gruppe)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-pb-sand-dim">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div className="mb-8 md:mb-10" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <label className="flex items-start gap-3 cursor-pointer group min-h-[44px]">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => {
                    setPrivacyAccepted(e.target.checked);
                    if (errors.privacy) setErrors((er) => ({ ...er, privacy: "" }));
                  }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${privacyAccepted ? "bg-pb-teal border-pb-teal" : errors.privacy ? "border-pb-error" : "border-pb-steel group-hover:border-pb-teal/50"}`}>
                  {privacyAccepted && (
                    <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-pb-sand-dim leading-relaxed">
                <Shield className="inline w-3 h-3 mr-1 text-pb-teal relative -top-px" />
                Ich akzeptiere die <a href="#" className="text-pb-teal underline hover:text-pb-teal-light">Datenschutzerklärung</a> und stimme der Verarbeitung meiner Daten zu.
              </span>
            </label>
            <AnimatePresence>
              {errors.privacy && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-pb-error text-xs mt-1.5 ml-8 font-medium">
                  {errors.privacy}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div className="pb-4 pb-safe-bottom" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
            <motion.button onClick={handleSubmit} className="pb-btn pb-btn-primary text-base md:text-lg w-full py-4" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              Foto erhalten
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}