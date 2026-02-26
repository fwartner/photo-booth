"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Superpower, SUPERPOWERS } from "@/lib/types";

interface Props {
  superpower: Superpower;
}

const PROCESSING_MESSAGES = [
  "Foto wird analysiert...",
  "KI wird aktiviert...",
  "Superkraft wird angewandt...",
  "Magie entsteht...",
  "Fast fertig...",
];

export default function ProcessingView({ superpower }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const sp = SUPERPOWERS[superpower];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % PROCESSING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rm-full-height flex flex-col">
      {/* Nav */}
      <nav className="rm-nav flex items-center justify-center">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-6 md:h-7" />
      </nav>

      {/* Content */}
      <div className="flex-1 bg-rm-dark flex items-center justify-center relative overflow-hidden">
        {/* Background animation */}
        <BackgroundEffect superpower={superpower} color={sp.color} />

        {/* Central content */}
        <div className="z-10 text-center px-6">
          {/* Icon */}
          <motion.div
            className="text-5xl md:text-7xl mb-6 md:mb-10"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {sp.icon}
          </motion.div>

          {/* Progress ring */}
          <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-6 md:mb-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={sp.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 15, ease: "linear" }}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ background: sp.color }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Message carousel */}
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-white text-base md:text-xl font-semibold mb-2 md:mb-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {PROCESSING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>

          <p className="text-white/40 text-xs md:text-sm mb-6 md:mb-8">
            Superkraft: <span style={{ color: sp.color }}>{sp.label}</span>
          </p>

          {/* Shimmer bar */}
          <div className="w-48 h-0.5 mx-auto rounded-full overflow-hidden bg-white/10">
            <div className="w-full h-full animate-processing-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundEffect({ superpower, color }: { superpower: Superpower; color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Subtle radial gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)`,
        }}
      />

      {superpower === "superhero" && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 120 + i * 100,
                height: 120 + i * 100,
                border: `1px solid ${color}15`,
              }}
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {superpower === "time_traveler" && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 180 + i * 100,
                height: 180 + i * 100,
                border: `1px solid ${color}15`,
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 10 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[0, 120, 240].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: `${color}40`,
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${deg}deg) translateY(-${90 + i * 50}px)`,
                  }}
                />
              ))}
            </motion.div>
          ))}
        </>
      )}

      {superpower === "fantasy" && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: color,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ border: `1px solid ${color}10` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute inset-6 rounded-full"
              style={{ border: `1px solid ${color}08` }}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
