"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import ItemListEditor, { type FieldDef } from "@/components/admin/ItemListEditor";
import { useContent } from "@/lib/ContentContext";
import type { Stat } from "@/lib/types";

const fields: FieldDef<Stat>[] = [
  { key: "label", label: "名称", placeholder: "文章" },
  { key: "value", label: "数值", type: "number", placeholder: "42" },
  { key: "suffix", label: "后缀", placeholder: "篇" },
  {
    key: "color",
    label: "颜色",
    placeholder: "cyber-blue",
    hint: "可选：cyber-blue / cyber-purple / cyber-pink / cyber-green",
  },
];

export default function StatsAdminPage() {
  const { content, updateSection } = useContent();
  return (
    <AdminPanel
      title="SYSTEM STATUS · 数据面板"
      description="首页数据卡片，建议保持 4 项以匹配栅格"
    >
      <ItemListEditor<Stat>
        items={content.stats}
        fields={fields}
        onChange={(next) => updateSection("stats", next)}
        createDefault={() => ({
          label: "新数据",
          value: 0,
          suffix: "",
          color: "cyber-blue",
        })}
        titleKey="label"
        renderPreview={(s) => `${s.value}${s.suffix} · ${s.color}`}
      />
    </AdminPanel>
  );
}
