"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("页面运行时错误：", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cyber-black text-center px-6">
      <h2 className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-pink">
        页面出了点小问题
      </h2>
      <p className="text-gray-400 text-sm max-w-md">
        智能体对话框遇到异常，已自动拦截以免整页崩溃。你可以重试恢复。
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 border border-cyber-blue text-cyber-blue font-[family-name:var(--font-orbitron)] text-sm hover:bg-cyber-blue/10 transition-all"
      >
        重试
      </button>
    </div>
  );
}
