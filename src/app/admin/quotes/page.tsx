"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import ItemListEditor, { type FieldDef } from "@/components/admin/ItemListEditor";
import { useContent } from "@/lib/ContentContext";
import type { Quote } from "@/lib/types";

const fields: FieldDef<Quote>[] = [
  {
    key: "text",
    label: "语录内容",
    type: "textarea",
    placeholder: "代码是写给人看的...",
    span: 1,
  },
  { key: "author", label: "作者", placeholder: "Harold Abelson", span: 1 },
];

export default function QuotesAdminPage() {
  const { content, updateSection } = useContent();
  return (
    <AdminPanel
      title="RANDOM QUOTE · 语录"
      description="首页右下随机语录，每 8 秒自动切换"
    >
      <ItemListEditor<Quote>
        items={content.quotes}
        fields={fields}
        onChange={(next) => updateSection("quotes", next)}
        createDefault={() => ({ text: "新语录", author: "" })}
        titleKey="text"
        subtitleKey="author"
      />
    </AdminPanel>
  );
}
