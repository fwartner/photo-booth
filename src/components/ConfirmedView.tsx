"use client";

import { motion } from "framer-motion";
import { CheckCircle, Mail, Printer, RefreshCw } from "lucide-react";
import { Superpower, SUPERPOWERS } from "@/lib/types";

interface Props {
  email: string;
  superpower: Superpower;
  printPhoto: boolean;
  onRestart: () => void;
}

export default function ConfirmedView({ email, superpower, printPhoto, onRestart }: Props) {
  const sp = SUPERPOWERS[superpower];

  return (
    <div className="pb-full-h flex flex-col pb-gradient-bg relative">
      {/* Nav */}
      <nav className="pb-nav flex items-center justify-center relative z-10">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-5 brightness-0 invert opacity-60" />
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden px-6 py-8">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #18A092 0%, #034C80 50%, transparent 70%)" }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success icon */}
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.15,
            }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-pb-teal/10 border border-pb-teal/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-pb-teal" />
            </div>
          </motion.div>

          <motion.h1
            className="pb-display-md text-pb-white mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            Perfekt! {sp.icon}
          </motion.h1>

          <motion.p
            className="text-pb-sand-dim/60 text-sm md:text-base mb-8 md:mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Dein {sp.label}-Foto wird bearbeitet und ist gleich bei dir!
          </motion.p>

          {/* Status cards */}
          <motion.div
            className="space-y-2.5 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="bg-pb-charcoal border border-white/6 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pb-teal/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-pb-teal/70" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-pb-sand font-semibold text-xs">E-Mail wird gesendet</p>
                <p className="text-pb-sand-dim/40 text-[11px] truncate pb-mono">An {email}</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 3, ease: "linear" }}
              >
                <RefreshCw className="w-3.5 h-3.5 text-pb-sand-dim/20" />
              </motion.div>
            </div>

            {printPhoto && (
              <div className="bg-pb-charcoal border border-white/6 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pb-teal/10 flex items-center justify-center flex-shrink-0">
                  <Printer className="w-4 h-4 text-pb-teal/70" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-pb-sand font-semibold text-xs">Foto wird gedruckt</p>
                  <p className="text-pb-sand-dim/40 text-[11px] pb-mono">Bitte warte einen Moment...</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: 3, ease: "linear" }}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-pb-sand-dim/20" />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Restart */}
          <motion.button
            onClick={onRestart}
            className="pb-btn pb-btn-outline text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw className="w-4 h-4" />
            Nächster Besucher
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-3 px-6 border-t border-white/5 pb-safe-bottom">
        <div className="flex items-center justify-center gap-2">
          <span className="text-pb-sand-dim/20 text-[10px]">Powered by</span>
          <img src="/logo.svg" alt="RecyclingMonitor" className="h-3 brightness-0 invert opacity-20" />
        </div>
      </div>
    </div>
  );
}
