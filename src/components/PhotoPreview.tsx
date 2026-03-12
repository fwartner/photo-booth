"use client";

import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, ZoomIn } from "lucide-react";
import { Superpower, SUPERPOWERS } from "@/lib/types";
import { useState } from "react";

interface Props {
  photo: string;
  superpower: Superpower;
  onConfirm: () => void;
  onRetake: () => void;
}

export default function PhotoPreview({
  photo,
  superpower,
  onConfirm,
  onRetake,
}: Props) {
  const sp = SUPERPOWERS[superpower];
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="pb-full-h flex flex-col pb-gradient-bg">
      {/* Nav */}
      <nav className="pb-nav flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sp.icon}</span>
          <span className="text-white font-semibold text-sm">
            Dein {sp.label}-Foto
          </span>
        </div>
      </nav>

      {/* Step indicator */}
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
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-pb-teal to-pb-blue text-white flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="pb-label text-pb-teal">Ergebnis</span>
          </span>
          <span className="flex-1 h-px bg-white/10 max-w-8" />
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-white/5 text-pb-sand-dim/40 flex items-center justify-center text-[10px] font-bold">3</span>
            <span className="pb-label text-pb-sand-dim/40">Kontakt</span>
          </span>
        </div>
      </div>

      {/* Photo display */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <motion.div
          className="relative rounded-2xl overflow-hidden max-w-2xl w-full cursor-pointer"
          style={{ boxShadow: `0 0 60px ${sp.color}15, 0 20px 60px rgba(0,0,0,0.4)` }}
          onClick={() => setZoomed(!zoomed)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={photo}
            alt="Dein Superkraft-Foto"
            className={`w-full h-auto transition-transform duration-500 ${
              zoomed ? "scale-150" : "scale-100"
            }`}
          />

          {/* Zoom hint */}
          <motion.div
            className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ZoomIn className="w-4 h-4 text-white/60" />
          </motion.div>

          {/* Superpower badge */}
          <motion.div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 text-sm"
            style={{ background: `${sp.color}CC` }}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>{sp.icon}</span>
            <span className="text-white font-semibold">{sp.label}</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Action area */}
      <motion.div
        className="p-4 md:p-6 pb-safe-bottom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <p className="text-white/40 text-center mb-3 text-sm font-medium">
          Zufrieden mit deinem Foto?
        </p>

        <div className="flex gap-3 max-w-lg mx-auto">
          <motion.button
            onClick={onRetake}
            className="pb-btn pb-btn-outline flex-1 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4" />
            Nochmal
          </motion.button>

          <motion.button
            onClick={onConfirm}
            className="pb-btn pb-btn-primary flex-[2] text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Weiter
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
