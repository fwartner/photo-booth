"use client";

import { motion } from "framer-motion";
import { Heldentyp } from "@/lib/types";

interface Props {
  id: Heldentyp;
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
      className={`pb-card pb-card-interactive relative p-4 md:p-5 text-center overflow-hidden w-full ${
        selected ? "pb-card-selected" : ""
      }`}
      whileTap={{ scale: 0.97 }}
      layout
    >
      {/* Selection indicator — gradient top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl transition-opacity duration-200"
        style={{
          background: `linear-gradient(90deg, #18A092, ${color})`,
          opacity: selected ? 1 : 0,
        }}
      />

      {/* Check badge */}
      {selected && (
        <motion.div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #18A092, #034C80)" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl md:text-3xl mb-2.5 mx-auto transition-all duration-200"
        style={{
          background: selected ? `${color}15` : "rgba(255,255,255,0.03)",
          border: `1px solid ${selected ? `${color}25` : "rgba(255,255,255,0.05)"}`,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <h3
        className="font-semibold text-sm md:text-base mb-0.5 transition-colors duration-200 leading-tight"
        style={{ color: selected ? color : "#E8EDEF" }}
      >
        {label}
      </h3>
      <p className="text-pb-sand-dim text-[10px] md:text-xs leading-relaxed opacity-50">
        {description}
      </p>

      {/* Ambient glow when selected */}
      {selected && (
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: `${color}12` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Hero-specific subtle effects */}
      {selected && id === "transparenz_scout" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
                width: "60%",
                left: "20%",
                top: `${35 + i * 15}%`,
              }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>
      )}

      {selected && id === "effizienz_architekt" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: color,
                left: `${25 + i * 25}%`,
                bottom: "20%",
              }}
              animate={{ y: [0, -30, -60], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}

      {selected && id === "impact_maker" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute text-[8px]"
              style={{ left: `${30 + i * 30}%`, top: `${40 + (i % 2) * 20}%` }}
              animate={{ opacity: [0, 0.5, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
            >
              ♻️
            </motion.div>
          ))}
        </div>
      )}

      {selected && id === "smarter_entscheider" && (
        <motion.div
          className="absolute bottom-3 right-3 w-8 h-8 border border-current rounded-full opacity-10 pointer-events-none hidden md:block"
          style={{ borderColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.button>
  );
}
