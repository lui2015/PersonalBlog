"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import ItemListEditor, { type FieldDef } from "@/components/admin/ItemListEditor";
import { useContent } from "@/lib/ContentContext";
import type { Skill } from "@/lib/types";

const fields: FieldDef<Skill>[] = [
  { key: "name", label: "技能名称", placeholder: "React/Next.js" },
  {
    key: "level",
    label: "熟练度",
    type: "number",
    placeholder: "0 - 100",
    hint: "0 ~ 100 之间的整数",
  },
];

export default function SkillsAdminPage() {
  const { content, updateSection } = useContent();
  return (
    <AdminPanel
      title="SKILL RADAR · 技能雷达"
      description="技能数量建议 4-8 项，雷达图按顺序绘制"
    >
      <ItemListEditor<Skill>
        items={content.skills}
        fields={fields}
        onChange={(next) =>
          updateSection(
            "skills",
            next.map((s) => ({
              ...s,
              level: Math.max(0, Math.min(100, Number(s.level) || 0)),
            }))
          )
        }
        createDefault={() => ({ name: "新技能", level: 50 })}
        titleKey="name"
        renderPreview={(s) => `level: ${s.level}%`}
      />
    </AdminPanel>
  );
}
