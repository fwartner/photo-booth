"use client";

import { motion } from "framer-motion";
import { Check, RotateCcw, ZoomIn, Printer } from "lucide-react";
import { Superpower, SUPERPOWERS } from "@/lib/types";
import { useState } from "react";

interface Props {
  photo: string;
  superpower: Superpower;
  onConfirm: (printPhoto: boolean) => void;
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
  const [printPhoto, setPrintPhoto] = useState(true);

  return (
    <div className="rm-full-height bg-rm-dark flex flex-col">
      {/* Nav */}
      <nav className="rm-nav flex items-center justify-center">
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-lg md:text-xl">{sp.icon}</span>
          <span className="text-white font-semibold text-xs md:text-sm">
            Dein {sp.label}-Foto
          </span>
        </div>
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
          <span className="flex items-center gap-1 md:gap-1.5 text-white/40">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-teal text-white flex items-center justify-center text-[10px] md:text-xs font-bold">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            Foto
          </span>
          <span className="flex-1 h-px bg-white/20 max-w-8" />
          <span className="flex items-center gap-1 md:gap-1.5 text-rm-teal font-semibold">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rm-teal text-white flex items-center justify-center text-[10px] md:text-xs font-bold">3</span>
            Ergebnis
          </span>
        </div>
      </div>

      {/* Photo display */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-6">
        <motion.div
          className="relative rounded-xl md:rounded-2xl overflow-hidden max-w-2xl w-full cursor-pointer"
          style={{
            boxShadow: `0 0 40px ${sp.color}15, 0 12px 40px rgba(0,0,0,0.3)`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => setZoomed(!zoomed)}
        >
          <img
            src={photo}
            alt="Dein Superkraft-Foto"
            className={`w-full h-auto transition-transform duration-500 ${
              zoomed ? "scale-150" : "scale-100"
            }`}
          />

          {/* Zoom hint */}
          <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/40 backdrop-blur-sm rounded-full p-1.5 md:p-2">
            <ZoomIn className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" />
          </div>

          {/* Superpower badge */}
          <motion.div
            className="absolute top-2.5 left-2.5 md:top-4 md:left-4 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 md:gap-1.5 text-xs md:text-sm"
            style={{ background: `${sp.color}CC` }}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span>{sp.icon}</span>
            <span className="text-white font-semibold">{sp.label}</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Action area */}
      <motion.div
        className="p-4 md:p-6 rm-safe-bottom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <p className="text-white/50 text-center mb-3 md:mb-4 text-xs md:text-sm font-medium">
          Gefällt dir dein Foto?
        </p>

        {/* Print toggle */}
        <motion.button
          type="button"
          onClick={() => setPrintPhoto(!printPhoto)}
          className={`flex items-center gap-3 w-full max-w-lg mx-auto mb-3 md:mb-4 p-3 md:p-4 rounded-xl transition-all duration-200 ${
            printPhoto
              ? "bg-white/15 border border-white/20"
              : "bg-white/5 border border-white/10"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              printPhoto ? "bg-rm-teal" : "bg-white/10"
            }`}
          >
            <Printer className={`w-4 h-4 md:w-5 md:h-5 ${printPhoto ? "text-white" : "text-white/40"}`} />
          </div>
          <div className="text-left flex-1">
            <p className={`font-semibold text-xs md:text-sm ${printPhoto ? "text-white" : "text-white/60"}`}>
              Foto drucken
            </p>
            <p className="text-white/40 text-[11px] md:text-xs">
              {printPhoto ? "Dein Foto wird vor Ort ausgedruckt" : "Nur per E-Mail erhalten"}
            </p>
          </div>
          <div
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
              printPhoto ? "bg-rm-teal" : "bg-white/20"
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
              animate={{ left: printPhoto ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </motion.button>

        {/* Action buttons */}
        <div className="flex gap-2.5 md:gap-3 max-w-lg mx-auto">
          <motion.button
            onClick={onRetake}
            className="rm-btn rm-btn-outline flex-1 text-sm md:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4" />
            Nochmal
          </motion.button>

          <motion.button
            onClick={() => onConfirm(printPhoto)}
            className="rm-btn rm-btn-teal flex-[2] text-sm md:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check className="w-5 h-5" />
            Passt so!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
