"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
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
  const [superpower, setSuperpower] = useState<Superpower | "">("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!superpower) newErrors.superpower = "Bitte wähle eine Superkraft";
    if (!industry) newErrors.industry = "Bitte wähle eine Branche";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        superpower: superpower as Superpower,
        industry: industry as Industry,
      });
    }
  };

  return (
    <div className="pb-full-h flex flex-col pb-gradient-bg">
      {/* Nav */}
      <nav className="pb-nav flex items-center justify-between">
        <button
          onClick={onBack}
          className="pb-btn-ghost text-pb-sand-dim hover:text-pb-sand flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Zurück</span>
        </button>
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-5 md:h-6 brightness-0 invert opacity-80" />
        <div className="w-10 sm:w-20" />
      </nav>

      {/* Step indicator */}
      <div className="bg-pb-charcoal/50 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-3 text-xs">
          <StepBadge num="01" label="Superkraft" active />
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <StepBadge num="02" label="Foto" />
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <StepBadge num="03" label="Ergebnis" />
        </div>
      </div>

      {/* Form content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="pb-display-md text-pb-white mb-2">
              Wähle deine Superkraft
            </h2>
            <p className="pb-body-lg text-pb-sand-dim/70 mb-8 md:mb-10">
              Welche Kraft soll dein Foto-Ich bekommen?
            </p>
          </motion.div>

          {/* Superpower Selection */}
          <motion.div
            className="mb-8 md:mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="grid grid-cols-3 gap-2.5 md:gap-4">
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
                  className="text-pb-error text-xs mt-2 font-medium"
                >
                  {errors.superpower}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Industry */}
          <motion.div
            className="mb-8 md:mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <label className="pb-label text-pb-sand-dim block mb-2">
              Deine Branche
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value as Industry);
                  if (errors.industry)
                    setErrors((er) => ({ ...er, industry: "" }));
                }}
                className={`pb-input appearance-none cursor-pointer pr-10 ${
                  errors.industry ? "pb-input-error" : ""
                } ${!industry ? "text-pb-sand-dim/50" : ""}`}
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pb-sand-dim pointer-events-none" />
            </div>
            <AnimatePresence>
              {errors.industry && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-pb-error text-xs mt-1.5 font-medium"
                >
                  {errors.industry}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit */}
          <motion.div
            className="pb-4 pb-safe-bottom"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <motion.button
              onClick={handleSubmit}
              className="pb-btn pb-btn-primary text-base md:text-lg w-full py-4"
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

function StepBadge({ num, label, active, done }: { num: string; label: string; active?: boolean; done?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
          active
            ? "bg-gradient-to-r from-pb-teal to-pb-blue text-white"
            : done
            ? "bg-pb-teal text-white"
            : "bg-white/5 text-pb-sand-dim/40"
        }`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {done ? (
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
        ) : (
          num
        )}
      </span>
      <span className={`pb-label ${active ? "text-pb-teal" : "text-pb-sand-dim/40"}`}>{label}</span>
    </span>
  );
}
