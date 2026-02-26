"use client";

import { motion } from "framer-motion";
import { Superpower } from "@/lib/types";

interface Props {
  id: Superpower;
  label: string;
  description: string;
  icon: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

export default function SuperpowerCard({
  id,
  label,
  description,
  icon,
  color,
  selected,
  onSelect,
}: Props) {
  return (
    <motion.button
      onClick={onSelect}
      className={`rm-card rm-card-interactive relative p-3 md:p-6 text-left overflow-hidden w-full ${
        selected ? "rm-card-selected" : ""
      }`}
      whileTap={{ scale: 0.97 }}
      layout
    >
      {/* Selection check */}
      {selected && (
        <motion.div
          className="absolute top-2 right-2 md:top-4 md:right-4 w-5 h-5 md:w-7 md:h-7 rounded-full bg-rm-teal flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <svg
            className="w-3 h-3 md:w-4 md:h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      {/* Colored accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 md:h-1 rounded-t-2xl transition-opacity duration-300"
        style={{
          background: color,
          opacity: selected ? 1 : 0,
        }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl mb-2 md:mb-4 transition-colors duration-300"
        style={{
          background: selected ? `${color}15` : "#F1F5F9",
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <h3
        className="font-bold text-sm md:text-lg mb-0.5 md:mb-1.5 transition-colors duration-300 leading-tight"
        style={{ color: selected ? color : "#32373C" }}
      >
        {label}
      </h3>
      <p className="text-rm-gray text-[11px] md:text-sm leading-snug md:leading-relaxed hidden sm:block">
        {description}
      </p>

      {/* Subtle animation when selected */}
      {selected && id === "superhero" && (
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                background: color,
                left: `${25 + i * 25}%`,
                bottom: "15%",
              }}
              animate={{
                y: [0, -40, -80],
                opacity: [0.5, 0.2, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      )}

      {selected && id === "time_traveler" && (
        <motion.div
          className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-6 h-6 md:w-10 md:h-10 border md:border-2 rounded-full opacity-15 pointer-events-none"
          style={{ borderColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {selected && id === "fantasy" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute text-[10px]"
              style={{
                left: `${20 + i * 25}%`,
                top: `${30 + (i % 2) * 30}%`,
              }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </motion.button>
  );
}
