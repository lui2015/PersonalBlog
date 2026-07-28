"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ImagePart {
  type: "image_url";
  image_url: { url: string };
}

interface TextPart {
  type: "text";
  text: string;
}

interface Msg {
  role: "user" | "assistant";
  content: string | (TextPart | ImagePart)[];
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
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typed]);

  if (!open) return null;

  const imageToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const send = async () => {
    const text = input.trim();
    if ((!text && !selectedImage) || loading) return;

    // 构建用户消息内容
    let userContent: string | (TextPart | ImagePart)[] = text;
    if (selectedImage) {
      const base64 = await imageToBase64(selectedImage.file);
      const parts: (TextPart | ImagePart)[] = [];
      if (text) parts.push({ type: "text" as const, text });
      parts.push({
        type: "image_url" as const,
        image_url: { url: base64 },
      });
      userContent = parts;
    }

    const nextMsgs: Msg[] = [...messages, { role: "user" as const, content: userContent }];
    setMessages(nextMsgs);
    setInput("");
    setSelectedImage(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过 10MB");
      return;
    }
    setSelectedImage({ file, preview: URL.createObjectURL(file) });
    e.target.value = "";
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
                {typeof m.content === "string" ? (
                  m.content
                ) : (
                  <div className="space-y-2">
                    {m.content.map((part, j) =>
                      typeof part === "string" ? (
                        <span key={j}>{part}</span>
                      ) : part.type === "text" ? (
                        <span key={j}>{part.text}</span>
                      ) : part.type === "image_url" ? (
                        <img
                          key={j}
                          src={part.image_url.url}
                          alt="用户图片"
                          className="max-w-full max-h-[240px] rounded-lg object-contain"
                        />
                      ) : null
                    )}
                  </div>
                )}
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
        <div className="border-t border-cyber-blue/30 p-3 space-y-2">
          {/* 图片预览 */}
          {selectedImage && (
            <div className="relative inline-block mx-4">
              <img
                src={selectedImage.preview}
                alt="预览"
                className="h-16 w-auto rounded-lg border border-cyber-blue/30 object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {/* 图片选择按钮 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="发送图片"
              className="w-9 h-9 shrink-0 rounded-lg bg-cyber-black/60 border border-cyber-border flex items-center justify-center text-gray-400 hover:text-cyber-pink hover:border-cyber-pink/30 transition-all disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
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
              disabled={loading || (!input.trim() && !selectedImage)}
              className="px-4 py-2 bg-cyber-blue/80 hover:bg-cyber-blue text-black font-[family-name:var(--font-orbitron)] text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
