"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "代码是写给人看的，只是顺便能在机器上运行。", author: "Harold Abelson" },
  { text: "简单是可靠的先决条件。", author: "Edsger Dijkstra" },
  { text: "任何足够先进的技术都和魔法无异。", author: "Arthur C. Clarke" },
  { text: "最好的代码是没有代码。", author: "Jeff Atwood" },
  { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
];

export default function QuoteModule() {
  const [current, setCurrent] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const quote = quotes[current].text;
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      if (i < quote.length) {
        setDisplayText(quote.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-6 hud-corner flex flex-col justify-center min-h-[250px]"
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-green mb-6">
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
            <p className="text-lg text-gray-200 font-[family-name:var(--font-mono)] leading-relaxed mb-4">
              <span className="text-cyber-green mr-2">$</span>
              {displayText}
              <span className="inline-block w-2 h-5 bg-cyber-green/80 ml-1 animate-pulse" />
            </p>
            <p className="text-sm text-gray-500 text-right">
              — {quotes[current].author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
