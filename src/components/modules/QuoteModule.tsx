"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

export default function QuoteModule() {
  const { content } = useContent();
  const quotes = content.quotes;
  const [current, setCurrent] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (current >= quotes.length) setCurrent(0);
  }, [quotes.length, current]);

  useEffect(() => {
    const quote = quotes[current];
    if (!quote) return;
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      if (i < quote.text.length) {
        setDisplayText(quote.text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [current, quotes]);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (quotes.length === 0) {
    return (
      <div className="cyber-card p-6 hud-corner text-gray-500 text-sm font-[family-name:var(--font-mono)] flex items-center justify-center min-h-[250px]">
        // 暂无语录
      </div>
    );
  }

  const quote = quotes[current] ?? quotes[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-4 sm:p-6 hud-corner flex flex-col justify-center min-h-[200px] sm:min-h-[250px]"
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-green mb-4 sm:mb-6">
        ◈ RANDOM QUOTE
      </h3>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm sm:text-lg text-gray-200 font-[family-name:var(--font-mono)] leading-relaxed mb-4 break-words">
              <span className="text-cyber-green mr-2">$</span>
              {displayText}
              <span className="inline-block w-2 h-5 bg-cyber-green/80 ml-1 animate-pulse" />
            </p>
            <p className="text-sm text-gray-500 text-right">— {quote.author}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
