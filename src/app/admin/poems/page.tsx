"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import ItemListEditor, { type FieldDef } from "@/components/admin/ItemListEditor";
import { useContent } from "@/lib/ContentContext";
import type { Poem } from "@/lib/types";

const fields: FieldDef<Poem>[] = [
  { key: "title", label: "题目", placeholder: "静夜思" },
  { key: "author", label: "作者", placeholder: "李白" },
  { key: "dynasty", label: "朝代", placeholder: "唐" },
  {
    key: "content",
    label: "正文",
    type: "textarea",
    placeholder: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
    hint: "支持换行，使用 \\n 分隔",
    span: 1,
  },
];

export default function PoemsAdminPage() {
  const { content, updateSection } = useContent();
  return (
    <AdminPanel
      title="POETRY · 诗词模块"
      description="首页左侧诗词模块的列表，按顺序循环展示"
    >
      <ItemListEditor<Poem>
        items={content.poems}
        fields={fields}
        onChange={(next) => updateSection("poems", next)}
        createDefault={() => ({
          title: "未命名",
          author: "",
          dynasty: "",
          content: "",
        })}
        titleKey="title"
        subtitleKey="author"
        renderPreview={(p) => p.content}
      />
    </AdminPanel>
  );
}
