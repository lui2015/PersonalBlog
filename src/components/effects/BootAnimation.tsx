"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BootAnimation() {
  const [isBooting, setIsBooting] = useState(true);
  const [lines, setLines] = useState<string[]>([]);

  const bootSequence = [
    "> INITIALIZING 鲁力铭 v2.0...",
    "> LOADING NEURAL NETWORK...",
    "> ESTABLISHING SECURE CONNECTION...",
    "> RENDERING HOLOGRAPHIC INTERFACE...",
    "> SYSTEM ONLINE ✓",
  ];

  useEffect(() => {
    const hasBooted = sessionStorage.getItem("hasBooted");
    if (hasBooted) {
      setIsBooting(false);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < bootSequence.length) {
        setLines((prev) => [...prev, bootSequence[index]]);
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setIsBooting(false);
          sessionStorage.setItem("hasBooted", "true");
        }, 300);
      }
    }, 250);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isBooting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-cyber-black"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-lg p-8">
            <div className="mb-6 text-center">
              <h1 className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue neon-text">
                鲁力铭
              </h1>
            </div>
            <div className="cyber-card p-6 font-[family-name:var(--font-mono)] text-sm">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 ${
                    i === lines.length - 1 && line.includes("✓")
                      ? "text-cyber-green"
                      : "text-cyber-blue"
                  }`}
                >
                  {line}
                </motion.div>
              ))}
              <motion.div
                className="mt-4 h-1 bg-cyber-dark rounded overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-cyber-blue"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
