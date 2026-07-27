"use client";

import { motion } from "framer-motion";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminPanel({ title, description, action, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="cyber-card hud-corner p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 pb-4 border-b border-cyber-border/40">
        <div>
          <h2 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue">
            ◆ {title}
          </h2>
          {description && (
            <p className="text-xs text-gray-500 mt-1 font-[family-name:var(--font-mono)]">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </motion.div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-[11px] text-cyber-blue mb-1.5 font-[family-name:var(--font-mono)] tracking-widest">
        [{label.toUpperCase()}]
      </span>
      {children}
      {hint && <span className="block mt-1 text-[10px] text-gray-600">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full bg-cyber-black/60 border border-cyber-border px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_8px_var(--color-cyber-blue)] transition-all font-[family-name:var(--font-mono)]";

export const textareaClass = inputClass + " resize-y min-h-[100px]";

export const btnPrimary =
  "px-4 py-2 text-xs font-[family-name:var(--font-orbitron)] border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 hover:shadow-[0_0_12px_var(--color-cyber-blue)] transition-all";

export const btnGhost =
  "px-3 py-1.5 text-xs font-[family-name:var(--font-mono)] border border-cyber-border text-gray-400 hover:text-cyber-blue hover:border-cyber-blue transition-all";

export const btnDanger =
  "px-3 py-1.5 text-xs font-[family-name:var(--font-mono)] border border-cyber-pink/60 text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-[0_0_10px_var(--color-cyber-pink)] transition-all";

export const labelClass =
  "block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5 font-[family-name:var(--font-mono)]";

export const selectClass = inputClass;
