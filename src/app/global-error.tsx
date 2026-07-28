"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#05070d",
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#ff6ec7", margin: 0 }}>
          页面加载失败
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", maxWidth: "28rem" }}>
          发生了意外错误。请点击下方按钮重试。
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.25rem",
            border: "1px solid #00f0ff",
            color: "#00f0ff",
            background: "transparent",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}
