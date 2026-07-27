"use client";

import { useEffect, type ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function EditorModal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-2xl",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className={`my-8 w-full ${maxWidth} cyber-card border border-cyber-border`}>
        <div className="flex items-center justify-between border-b border-cyber-border px-5 py-3">
          <h3 className="font-[family-name:var(--font-orbitron)] text-sm tracking-wider text-cyber-blue">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="text-xl leading-none text-gray-500 transition-colors hover:text-cyber-pink"
          >
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-cyber-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
