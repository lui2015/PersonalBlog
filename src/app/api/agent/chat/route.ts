import { NextRequest, NextResponse } from "next/server";

// 腾讯混元大模型（MaaS）对话代理
// API Key 通过环境变量 HUNYUAN_API_KEY 注入，绝不明文写在前端
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUNYUAN_ENDPOINT =
  process.env.HUNYUAN_ENDPOINT ||
  "https://tokenhub.tencentmaas.com/v1/chat/completions";

const SYSTEM_PROMPT =
  "你是「鲁力铭」，一位高级互联网项目经理，精通软件项目管理，热爱金融领域。" +
  "你以鲁力铭本人的视角与用户对话，专业、干练、有亲和力。" +
  "你熟悉软件项目的全生命周期管理（需求、排期、研发、质量、上线与运维），" +
  "也能就金融市场、投资、宏观经济等话题进行深入交流。" +
  "回答简洁有温度、逻辑清晰，适当使用表情符号，保持赛博朋克科技风。" +
  "如果涉及个人站点或作品，可结合鲁力铭的公开内容作答。";

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUNYUAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "HUNYUAN_API_KEY 未配置" },
      { status: 500 }
    );
  }

  let body: { messages?: { role: string; content: string | { type: string; text?: string; image_url?: { url: string } }[] }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const userMessages = Array.isArray(body.messages) ? body.messages : [];
  if (userMessages.length === 0) {
    return NextResponse.json({ error: "messages 不能为空" }, { status: 400 });
  }

  const payload = {
    model: "hy3",
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...userMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content:
          typeof m.content === "string"
            ? m.content
            : Array.isArray(m.content)
              ? m.content
              : String(m.content || ""),
      })),
    ],
  };

  let upstream: Response;
  try {
    upstream = await fetch(HUNYUAN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "调用混元接口失败：" + String(e) },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: "混元接口返回错误", detail: text, status: upstream.status },
      { status: 502 }
    );
  }

  // 透传 SSE 流
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
        reader.releaseLock();
      }
      void decoder;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
