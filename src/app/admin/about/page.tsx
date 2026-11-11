"use client";

import { useEffect, useState } from "react";
import { useContent } from "@/lib/ContentContext";
import { DEFAULT_CONTENT } from "@/lib/defaultContent";
import AdminPanel, { btnPrimary, btnGhost } from "@/components/admin/AdminPanel";
import AboutEditor from "@/components/about/AboutEditor";
import type { AboutContent } from "@/lib/types";

export default function AboutAdminPage() {
  const { content, updateSection, ready, flush } = useContent();
  const [draft, setDraft] = useState<AboutContent>(content.about ?? DEFAULT_CONTENT.about);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) setDraft(structuredClone(content.about ?? DEFAULT_CONTENT.about));
    // 只在首次同步服务端数据时重置草稿，避免编辑中被覆盖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onSave = async () => {
    updateSection("about", draft);
    await flush();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <AdminPanel
      title="关于我"
      description="管理 /about 页面：个人资料、社交链接、技能树与履历时间线"
      action={
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-cyber-green font-[family-name:var(--font-mono)]">
              ✓ 已保存
            </span>
          )}
          <button
            onClick={() => setDraft(structuredClone(content.about ?? DEFAULT_CONTENT.about))}
            className={btnGhost}
          >
            撤销
          </button>
          <button onClick={onSave} className={btnPrimary}>
            保存
          </button>
        </div>
      }
    >
      <AboutEditor value={draft} onChange={setDraft} />
    </AdminPanel>
  );
}
