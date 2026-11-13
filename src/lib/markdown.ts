/**
 * 轻量 Markdown → 安全 HTML。
 * 前台文章详情、后台编辑器预览、开放接口 works.contentHtml 共用同一套规则，
 * 保证「编辑时看到的格式」与「接口输出的格式」完全一致。
 *
 * 安全：所有用户文本先做 HTML 转义；链接/图片 URL 做协议白名单，
 * 生成的标签全部由本文件构造，可安全用于 dangerouslySetInnerHTML 或小程序 rich-text。
 */

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    return "&#39;";
  });
}

/** 只允许 http(s)、mailto、站内路径与锚点，杜绝 javascript:/data: 等伪协议 */
function safeUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url || url.startsWith("//")) return null;
  if (/^(javascript|data|vbscript|file):/i.test(url)) return null;
  if (/^(https?:\/\/|mailto:|\/(?!\/)|\.\/|#)/i.test(url)) return url;
  return null;
}

/** 行内语法：图片、链接、行内代码、加粗、斜体 */
function renderInline(text: string): string {
  const stash: string[] = [];
  const put = (html: string) => `\u0000${stash.push(html) - 1}\u0000`;
  let out = escapeHtml(text);

  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, url: string) => {
    const safe = safeUrl(url);
    return safe ? put(`<img src="${safe}" alt="${alt}" loading="lazy" />`) : alt;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const safe = safeUrl(url);
    return safe
      ? put(`<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`)
      : label;
  });
  out = out.replace(/`([^`]+)`/g, (_m, code: string) => put(`<code>${code}</code>`));
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/\u0000(\d+)\u0000/g, (_m, idx: string) => stash[Number(idx)] ?? "");
  return out;
}

/** Markdown 支持的格式：#~###### 标题、**加粗**、*斜体*、链接、图片、行内代码、
 *  ``` 代码块、- / 1. 列表、> 引用、--- 分隔线；普通段落内单换行转为 <br />。 */
export function markdownToHtml(md: string): string {
  const lines = String(md ?? "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let paragraph: string[] = [];
  let i = 0;

  const flush = () => {
    if (paragraph.length === 0) return;
    out.push(`<p>${paragraph.map(renderInline).join("<br />")}</p>`);
    paragraph = [];
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith("```")) {
      flush();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (!trimmed) {
      flush();
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      out.push("<hr />");
      i += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      const level = Math.min(heading[1].length + 1, 6);
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>${quote.map(renderInline).join("<br />")}</blockquote>`);
      continue;
    }

    if (/^([-*+]|\d+\.)\s+/.test(trimmed)) {
      flush();
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (i < lines.length && /^([-*+]|\d+\.)\s+/.test(lines[i].trim())) {
        items.push(
          `<li>${renderInline(lines[i].trim().replace(/^([-*+]|\d+\.)\s+/, ""))}</li>`
        );
        i += 1;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    paragraph.push(lines[i]);
    i += 1;
  }

  flush();
  return out.join("\n");
}
