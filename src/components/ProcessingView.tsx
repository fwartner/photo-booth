"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Superpower, SUPERPOWERS } from "@/lib/types";

interface Props {
  superpower: Superpower;
}

const PROCESSING_MESSAGES = [
  "Foto wird analysiert",
  "KI wird aktiviert",
  "Superkraft wird angewandt",
  "Bild wird transformiert",
  "Fast fertig",
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
    <div className="pb-full-h flex flex-col pb-gradient-bg relative">
      {/* Nav */}
      <nav className="pb-nav flex items-center justify-center relative z-10">
        <img src="/logo.svg" alt="RecyclingMonitor" className="h-5 brightness-0 invert opacity-50" />
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
        {/* Background animation */}
        <BackgroundEffect superpower={superpower} color={sp.color} />

        {/* Central content */}
        <div className="relative z-10 text-center px-6 w-full max-w-md">
          {/* Icon */}
          <motion.div
            className="text-5xl md:text-7xl mb-8 md:mb-12"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {sp.icon}
          </motion.div>

          {/* Progress ring */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 md:mb-12">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="url(#tealGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 15, ease: "linear" }}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
              />
              <defs>
                <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#18A092" />
                  <stop offset="100%" stopColor="#034C80" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-pb-teal"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Message carousel */}
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-pb-white text-base md:text-lg font-semibold mb-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {PROCESSING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>

          <p className="text-pb-sand-dim/40 text-xs mb-8">
            Superkraft: <span style={{ color: sp.color }}>{sp.label}</span>
          </p>

          {/* Shimmer bar */}
          <div className="w-48 h-[2px] mx-auto overflow-hidden rounded-full bg-white/5">
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
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 60%)`,
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
                border: `1px solid ${color}10`,
              }}
              animate={{ scale: [1, 2], opacity: [0.2, 0] }}
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
                border: `1px solid ${color}10`,
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
                    background: `${color}30`,
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
          {Array.from({ length: 8 }).map((_, i) => {
            const positions = [
              { x: 15, y: 20 }, { x: 75, y: 15 }, { x: 85, y: 65 }, { x: 25, y: 80 },
              { x: 55, y: 25 }, { x: 40, y: 70 }, { x: 70, y: 45 }, { x: 30, y: 40 },
            ];
            const durations = [2.5, 3.2, 2.8, 3.5, 2.6, 3.0, 2.9, 3.3];
            const delays = [0, 0.8, 0.3, 1.2, 0.5, 1.0, 0.7, 1.4];
            return (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: color,
                  left: `${positions[i].x}%`,
                  top: `${positions[i].y}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: durations[i],
                  repeat: Infinity,
                  delay: delays[i],
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
