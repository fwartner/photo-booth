"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ChevronDown, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import {
  FormData,
  Superpower,
  Industry,
  SUPERPOWERS,
  INDUSTRIES,
} from "@/lib/types";
import SuperpowerCard from "./SuperpowerCard";

interface Props {
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

export default function RegistrationForm({ onSubmit, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [superpower, setSuperpower] = useState<Superpower | "">("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "E-Mail-Adresse ist erforderlich";
    else if (!validateEmail(email))
      newErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein";

    if (!superpower) newErrors.superpower = "Bitte wähle eine Superkraft";
    if (!industry) newErrors.industry = "Bitte wähle eine Branche";
    if (!privacyAccepted)
      newErrors.privacy = "Bitte akzeptiere die Datenschutzerklärung";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        email,
        superpower: superpower as Superpower,
        industry: industry as Industry,
        privacy_accepted: privacyAccepted,
      });
    }
  };

  return (
    <div className="rm-full-height flex flex-col bg-rm-gray-light">
      {/* Nav */}
      <nav className="rm-nav flex items-center justify-between">
        <button
          onClick={onBack}
          className="rm-btn-ghost text-white/80 hover:text-white flex items-center gap-1.5 text-sm rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Zurück</span>
        </button>
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-6 md:h-7" />
        <div className="w-10 sm:w-20" />
      </nav>

      {/* Step indicator */}
      <div className="bg-white border-b border-rm-gray-200">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 text-xs md:text-sm">
          <span className="flex items-center gap-1 md:gap-1.5 text-rm-teal font-semibold">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-teal text-white flex items-center justify-center text-[10px] md:text-xs font-bold">1</span>
            <span className="hidden sm:inline">Registrieren</span>
            <span className="sm:hidden">Daten</span>
          </span>
          <span className="flex-1 h-px bg-rm-gray-200 max-w-8" />
          <span className="flex items-center gap-1 md:gap-1.5 text-rm-gray">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-gray-200 text-rm-gray flex items-center justify-center text-[10px] md:text-xs font-bold">2</span>
            Foto
          </span>
          <span className="flex-1 h-px bg-rm-gray-200 max-w-8" />
          <span className="flex items-center gap-1 md:gap-1.5 text-rm-gray">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-gray-200 text-rm-gray flex items-center justify-center text-[10px] md:text-xs font-bold">3</span>
            Ergebnis
          </span>
        </div>
      </div>

      {/* Form content – scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="rm-heading-2 text-rm-dark mb-1 md:mb-2">Deine Daten</h2>
            <p className="rm-body-lg text-rm-gray mb-6 md:mb-10">
              Fülle das Formular aus, um dein Superkraft-Foto zu erhalten.
            </p>
          </motion.div>

          {/* Superpower Selection */}
          <motion.div
            className="mb-6 md:mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <label className="block text-xs md:text-sm font-semibold text-rm-dark uppercase tracking-wider mb-3 md:mb-4">
              Wähle deine Superkraft
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {(
                Object.entries(SUPERPOWERS) as [
                  Superpower,
                  (typeof SUPERPOWERS)[Superpower],
                ][]
              ).map(([key, sp]) => (
                <SuperpowerCard
                  key={key}
                  id={key}
                  label={sp.label}
                  description={sp.description}
                  icon={sp.icon}
                  color={sp.color}
                  selected={superpower === key}
                  onSelect={() => {
                    setSuperpower(key);
                    setErrors((e) => ({ ...e, superpower: "" }));
                  }}
                />
              ))}
            </div>
            <AnimatePresence>
              {errors.superpower && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-rm-error text-xs md:text-sm mt-2 font-medium"
                >
                  {errors.superpower}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Email */}
          <motion.div
            className="mb-5 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <label className="block text-xs md:text-sm font-semibold text-rm-dark uppercase tracking-wider mb-1.5 md:mb-2">
              E-Mail-Adresse
            </label>
            <div className="relative">
              <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-rm-gray" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                }}
                placeholder="deine@email.de"
                className={`rm-input pl-10 md:pl-12 ${errors.email ? "rm-input-error" : ""}`}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-rm-error text-xs md:text-sm mt-1.5 font-medium"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Industry */}
          <motion.div
            className="mb-5 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <label className="block text-xs md:text-sm font-semibold text-rm-dark uppercase tracking-wider mb-1.5 md:mb-2">
              Branche
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value as Industry);
                  if (errors.industry)
                    setErrors((er) => ({ ...er, industry: "" }));
                }}
                className={`rm-input appearance-none cursor-pointer pr-10 md:pr-12 ${
                  errors.industry ? "rm-input-error" : ""
                } ${!industry ? "text-rm-gray" : ""}`}
              >
                <option value="" disabled>
                  Branche auswählen...
                </option>
                {(Object.entries(INDUSTRIES) as [Industry, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  )
                )}
              </select>
              <ChevronDown className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-rm-gray pointer-events-none" />
            </div>
            <AnimatePresence>
              {errors.industry && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-rm-error text-xs md:text-sm mt-1.5 font-medium"
                >
                  {errors.industry}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Privacy Checkbox */}
          <motion.div
            className="mb-6 md:mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <label className="flex items-start gap-3 cursor-pointer group min-h-[44px]">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => {
                    setPrivacyAccepted(e.target.checked);
                    if (errors.privacy)
                      setErrors((er) => ({ ...er, privacy: "" }));
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${
                    privacyAccepted
                      ? "bg-rm-teal border-rm-teal"
                      : errors.privacy
                      ? "border-rm-error"
                      : "border-rm-gray-200 group-hover:border-rm-teal"
                  }`}
                >
                  {privacyAccepted && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3.5 h-3.5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
              </div>
              <span className="text-xs md:text-sm text-rm-dark leading-relaxed">
                <Shield className="inline w-3.5 h-3.5 mr-1 text-rm-teal relative -top-px" />
                Ich akzeptiere die{" "}
                <a
                  href="#"
                  className="text-rm-teal underline hover:text-rm-teal-dark"
                >
                  Datenschutzerklärung
                </a>{" "}
                und stimme der Verarbeitung meiner Daten zu.
              </span>
            </label>
            <AnimatePresence>
              {errors.privacy && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-rm-error text-xs md:text-sm mt-1.5 ml-9 font-medium"
                >
                  {errors.privacy}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit */}
          <motion.div
            className="pb-4 rm-safe-bottom"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <motion.button
              onClick={handleSubmit}
              className="rm-btn rm-btn-teal text-base md:text-lg w-full py-3.5 md:py-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Weiter zum Foto
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
