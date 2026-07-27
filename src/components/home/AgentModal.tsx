"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function AgentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "你好，我是鲁力铭 👋 高级互联网项目经理，精通软件项目管理，也热爱金融领域。不管是项目交付还是市场投资，咱们都可以聊聊～",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typed]);

  if (!open) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMsgs = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);
    setTyped("");

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "请求失败");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              setTyped(full);
            }
          } catch {
            /* ignore */
          }
        }
      }
      setMessages((m) => [...m, { role: "assistant", content: full }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ 出错了：" + String(e) },
      ]);
    } finally {
      setLoading(false);
      setTyped("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-[600px] max-h-[85vh] bg-cyber-dark/95 border border-cyber-blue/50 rounded-xl shadow-[0_0_40px_var(--color-cyber-blue)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-blue/30 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-blue via-cyber-purple to-cyber-pink flex items-center justify-center font-[family-name:var(--font-orbitron)] text-white text-sm shadow-[0_0_15px_var(--color-cyber-purple)]">
              AI
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-orbitron)] text-white text-sm">
                鲁力铭
              </h3>
              <p className="text-[11px] text-gray-500">
                高级互联网项目经理 · 腾讯混元驱动
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyber-pink text-xl leading-none transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 text-sm rounded-lg leading-relaxed ${
                  m.role === "user"
                    ? "bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40"
                    : "bg-cyber-black/60 text-gray-200 border border-cyber-purple/30"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && typed && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-3 py-2 text-sm rounded-lg leading-relaxed bg-cyber-black/60 text-gray-200 border border-cyber-purple/30">
                {typed}
                <span className="inline-block w-1.5 h-4 bg-cyber-purple ml-1 animate-pulse align-middle" />
              </div>
            </div>
          )}
          {loading && !typed && (
            <div className="flex justify-start">
              <div className="px-3 py-2 text-sm rounded-lg bg-cyber-black/60 text-gray-400 border border-cyber-purple/30">
                思考中<span className="animate-pulse">…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-cyber-blue/30 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="和鲁力铭智能体聊聊…"
            disabled={loading}
            className="flex-1 bg-cyber-black/60 border border-cyber-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyber-blue focus:outline-none transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-cyber-blue/80 hover:bg-cyber-blue text-black font-[family-name:var(--font-orbitron)] text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
