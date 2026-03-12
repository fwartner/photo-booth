"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowLeft, Minus, Plus } from "lucide-react";
import {
  FormData,
  Heldentyp,
  Kategorie,
  Stilmodus,
  HELDENTYPEN,
  KATEGORIEN,
} from "@/lib/types";
import SuperpowerCard from "./SuperpowerCard";

interface Props {
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

export default function RegistrationForm({ onSubmit, onBack }: Props) {
  const [heldentyp, setHeldentyp] = useState<Heldentyp | "">("");
  const [kategorie, setKategorie] = useState<Kategorie | "">("");
  const [mode, setMode] = useState<Stilmodus>("professional");
  const [personenanzahl, setPersonenanzahl] = useState(1);
  const [firmenname, setFirmenname] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!heldentyp) newErrors.heldentyp = "Bitte wähle einen Heldentyp";
    if (!kategorie) newErrors.kategorie = "Bitte wähle eine Kategorie";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        heldentyp: heldentyp as Heldentyp,
        kategorie: kategorie as Kategorie,
        mode,
        personenanzahl,
        firmenname: firmenname || undefined,
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
          <StepBadge num="01" label="Konfiguration" active />
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <StepBadge num="02" label="Foto" />
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <StepBadge num="03" label="Ergebnis" />
        </div>
      </div>

      {/* Form content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="pb-display-md text-pb-white mb-1">
              Werde zum Helden
            </h2>
            <p className="pb-body-lg text-pb-sand-dim/70 mb-6 md:mb-8">
              Wähle deinen Heldentyp und deine Branche
            </p>
          </motion.div>

          {/* Heldentyp Selection — 2x2 grid */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <label className="pb-label text-pb-sand-dim block mb-2">Dein Heldentyp</label>
            <div className="grid grid-cols-2 gap-2.5 md:gap-3">
              {(
                Object.entries(HELDENTYPEN) as [
                  Heldentyp,
                  (typeof HELDENTYPEN)[Heldentyp],
                ][]
              ).map(([key, sp]) => (
                <SuperpowerCard
                  key={key}
                  id={key}
                  label={sp.label}
                  description={sp.description}
                  icon={sp.icon}
                  color={sp.color}
                  selected={heldentyp === key}
                  onSelect={() => {
                    setHeldentyp(key);
                    setErrors((e) => ({ ...e, heldentyp: "" }));
                  }}
                />
              ))}
            </div>
            <AnimatePresence>
              {errors.heldentyp && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-pb-error text-xs mt-2 font-medium"
                >
                  {errors.heldentyp}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Kategorie */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <label className="pb-label text-pb-sand-dim block mb-2">
              Deine Branche
            </label>
            <div className="relative">
              <select
                value={kategorie}
                onChange={(e) => {
                  setKategorie(e.target.value as Kategorie);
                  if (errors.kategorie)
                    setErrors((er) => ({ ...er, kategorie: "" }));
                }}
                className={`pb-input appearance-none cursor-pointer pr-10 ${
                  errors.kategorie ? "pb-input-error" : ""
                } ${!kategorie ? "text-pb-sand-dim/50" : ""}`}
              >
                <option value="" disabled>
                  Branche auswählen...
                </option>
                {(Object.entries(KATEGORIEN) as [Kategorie, string][]).map(
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
              {errors.kategorie && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-pb-error text-xs mt-1.5 font-medium"
                >
                  {errors.kategorie}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stilmodus toggle */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <label className="pb-label text-pb-sand-dim block mb-2">Stilmodus</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("professional")}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  mode === "professional"
                    ? "bg-pb-teal/15 border-pb-teal/40 text-pb-teal"
                    : "bg-white/3 border-white/10 text-pb-sand-dim/60 hover:border-white/20"
                }`}
              >
                <span className="block text-base mb-0.5">💼</span>
                Professional
                <span className="block text-[10px] opacity-60 mt-0.5">Seriös & LinkedIn-tauglich</span>
              </button>
              <button
                onClick={() => setMode("extreme")}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  mode === "extreme"
                    ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
                    : "bg-white/3 border-white/10 text-pb-sand-dim/60 hover:border-white/20"
                }`}
              >
                <span className="block text-base mb-0.5">🔥</span>
                Extreme
                <span className="block text-[10px] opacity-60 mt-0.5">Wow-Effekt & Social-Media</span>
              </button>
            </div>
          </motion.div>

          {/* Personenanzahl */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <label className="pb-label text-pb-sand-dim block mb-2">
              Anzahl Personen
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPersonenanzahl(Math.max(1, personenanzahl - 1))}
                disabled={personenanzahl <= 1}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-pb-sand-dim hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-pb-white">{personenanzahl}</span>
                <span className="text-pb-sand-dim/50 text-xs block">
                  {personenanzahl === 1 ? "Person" : "Personen"}
                </span>
              </div>
              <button
                onClick={() => setPersonenanzahl(Math.min(5, personenanzahl + 1))}
                disabled={personenanzahl >= 5}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-pb-sand-dim hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {personenanzahl >= 4 && (
              <p className="text-pb-sand-dim/40 text-[11px] mt-1.5">
                Zentrale Person wird visuell stärker akzentuiert
              </p>
            )}
          </motion.div>

          {/* Firmenname (optional) */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <label className="pb-label text-pb-sand-dim block mb-2">
              Firmenname <span className="text-pb-sand-dim/30">(optional)</span>
            </label>
            <input
              type="text"
              value={firmenname}
              onChange={(e) => setFirmenname(e.target.value)}
              placeholder="z.B. ALBA Group, Remondis..."
              className="pb-input"
            />
          </motion.div>

          {/* Submit */}
          <motion.div
            className="pb-4 pb-safe-bottom"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
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
