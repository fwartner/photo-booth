"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  onStart: () => void;
}

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="rm-full-height flex flex-col">
      {/* Nav bar */}
      <nav className="rm-nav flex items-center justify-between">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-6 md:h-8" />
        <span className="text-white/60 text-xs md:text-sm font-medium tracking-wide uppercase">
          Foto-Box
        </span>
      </nav>

      {/* Hero */}
      <div className="flex-1 rm-gradient-subtle relative flex items-center justify-center overflow-hidden px-5 py-8 md:px-8">
        {/* Background circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[70vw] h-[70vw] md:w-[60vw] md:h-[60vw] rounded-full bg-white/[0.04]" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[60vw] h-[60vw] md:w-[50vw] md:h-[50vw] rounded-full bg-white/[0.03]" />
          <motion.div
            className="absolute top-1/4 right-1/4 md:right-1/3 w-40 md:w-64 h-40 md:h-64 rounded-full bg-white/[0.03]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-base md:text-xl">⚡</span>
            <span className="text-white/90 text-xs md:text-sm font-semibold tracking-wide uppercase">
              Interaktive KI-Erfahrung
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="rm-heading-1 text-white mb-4 md:mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Entdecke deine
            <br />
            <span className="text-white/90">Superkraft</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="rm-body-lg text-white/75 max-w-md md:max-w-2xl mx-auto mb-8 md:mb-12 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            Mach ein Foto, wähle deine Superkraft und lass unsere KI dein Bild
            in etwas Magisches verwandeln!
          </motion.p>

          {/* CTA Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              onClick={onStart}
              className="rm-btn rm-btn-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Los geht&apos;s
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Steps preview – hidden on very small screens, compact on mobile */}
          <motion.div
            className="mt-10 md:mt-16 flex items-center justify-center gap-2 md:gap-3 text-white/40 text-xs md:text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="flex items-center gap-1 md:gap-1.5">
              <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] md:text-xs text-white/60">1</span>
              <span className="hidden xs:inline">Registrieren</span>
              <span className="xs:hidden">Start</span>
            </span>
            <span className="w-4 md:w-8 h-px bg-white/20" />
            <span className="flex items-center gap-1 md:gap-1.5">
              <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] md:text-xs text-white/60">2</span>
              Foto
            </span>
            <span className="w-4 md:w-8 h-px bg-white/20" />
            <span className="flex items-center gap-1 md:gap-1.5">
              <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] md:text-xs text-white/60">3</span>
              <span className="hidden xs:inline">Superkraft!</span>
              <span className="xs:hidden">Magie</span>
            </span>
          </motion.div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="bg-rm-blue-dark py-2.5 md:py-3 px-4 md:px-6 text-center rm-safe-bottom">
        <p className="text-white/30 text-[10px] md:text-xs font-medium">
          &copy; {new Date().getFullYear()} RecyclingMonitor
        </p>
      </div>
    </div>
  );
}
