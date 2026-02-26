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
    <div className="rm-full-height flex flex-col">
      {/* Nav */}
      <nav className="rm-nav flex items-center justify-center">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-6 md:h-7" />
      </nav>

      {/* Content */}
      <div className="flex-1 rm-gradient-subtle flex items-center justify-center relative overflow-hidden px-5 py-6">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-white/[0.03]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[40vw] h-[40vw] rounded-full bg-white/[0.02]" />
        </div>

        <motion.div
          className="relative z-10 text-center w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success icon */}
          <motion.div
            className="mb-5 md:mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.15,
            }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="rm-heading-2 text-white mb-2 md:mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            Perfekt! {sp.icon}
          </motion.h1>

          <motion.p
            className="text-white/70 text-sm md:text-lg mb-6 md:mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Dein {sp.label}-Foto wird bearbeitet und ist gleich bei dir!
          </motion.p>

          {/* Status cards */}
          <motion.div
            className="space-y-2.5 md:space-y-3 mb-6 md:mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-white font-semibold text-xs md:text-sm">E-Mail wird gesendet</p>
                <p className="text-white/50 text-[11px] md:text-xs truncate">An {email}</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 3, ease: "linear" }}
              >
                <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/30" />
              </motion.div>
            </div>

            {printPhoto && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Printer className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold text-xs md:text-sm">Foto wird gedruckt</p>
                  <p className="text-white/50 text-[11px] md:text-xs">Bitte warte einen Moment...</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: 3, ease: "linear" }}
                >
                  <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/30" />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Restart */}
          <motion.button
            onClick={onRestart}
            className="rm-btn rm-btn-outline text-sm md:text-base"
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
      <div className="bg-rm-blue-dark py-2.5 md:py-3 px-4 md:px-6 text-center rm-safe-bottom">
        <div className="flex items-center justify-center gap-2">
          <span className="text-white/30 text-[10px] md:text-xs">Powered by</span>
          <img src="/logo.svg" alt="RecyclingMonitor" className="h-3.5 md:h-4 opacity-30" />
        </div>
      </div>
    </div>
  );
}
