"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  onStart: () => void;
}

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="pb-full-h flex flex-col pb-gradient-bg relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(24,160,146,0.4) 0%, transparent 70%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(3,76,128,0.5) 0%, transparent 70%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </div>

      {/* Nav bar */}
      <nav className="pb-nav flex items-center justify-between relative z-10">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-5 md:h-6 brightness-0 invert opacity-80" />
        <span className="text-pb-teal text-sm font-semibold tracking-wide">
          Foto-Box
        </span>
      </nav>

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-8 md:px-12">
        <div className="w-full max-w-2xl text-center">
          {/* Eyebrow label */}
          <motion.div
            className="mb-5 md:mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pb-teal/10 border border-pb-teal/20 text-pb-teal text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-pb-teal animate-pulse" />
              Interaktive KI-Erfahrung
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="pb-display-xl text-pb-white mb-5 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Entdecke deine{" "}
            <span className="bg-gradient-to-r from-pb-teal to-pb-blue-light bg-clip-text text-transparent">
              Superkraft
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="pb-body-lg text-pb-sand-dim max-w-md mx-auto mb-10 md:mb-12"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            Mach ein Foto, wähle deine Kraft und lass
            unsere KI dich verwandeln.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              onClick={onStart}
              className="pb-btn pb-btn-primary text-lg md:text-xl px-10 md:px-14 py-4 md:py-5 shadow-lg"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Los geht&apos;s
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>

          {/* Step indicators */}
          <motion.div
            className="mt-14 md:mt-20 flex items-center justify-center gap-8 text-pb-sand-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { num: "01", label: "Superkraft", icon: "⚡" },
              { num: "02", label: "Foto", icon: "📸" },
              { num: "03", label: "Magie", icon: "✨" },
            ].map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <span className="text-lg">{step.icon}</span>
                <span className="text-xs font-medium text-pb-sand-dim/50">{step.label}</span>
                {i < 2 && (
                  <div className="absolute" style={{ display: "none" }} />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-3 px-6 border-t border-white/5">
        <p className="text-pb-sand-dim/30 text-center text-xs">
          &copy; {new Date().getFullYear()} RecyclingMonitor
        </p>
      </div>
    </div>
  );
}
