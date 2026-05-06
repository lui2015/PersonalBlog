"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import ItemListEditor, { type FieldDef } from "@/components/admin/ItemListEditor";
import { useContent } from "@/lib/ContentContext";
import type { Photo } from "@/lib/types";

const fields: FieldDef<Photo>[] = [
  { key: "title", label: "标题", placeholder: "城市夜景" },
  { key: "desc", label: "描述", placeholder: "霓虹灯下的未来都市" },
  {
    key: "src",
    label: "图片",
    type: "image",
    placeholder: "https://... 或上传本地图片",
    hint: "建议 600x400 或更高分辨率",
    span: 1,
  },
];

export default function PhotosAdminPage() {
  const { content, updateSection } = useContent();
  return (
    <AdminPanel
      title="PHOTO FRAME · 相框模块"
      description="首页右侧轮播相框使用的图片列表"
    >
      <ItemListEditor<Photo>
        items={content.photos}
        fields={fields}
        onChange={(next) => updateSection("photos", next)}
        createDefault={() => ({
          src: "https://picsum.photos/seed/new/600/400",
          title: "未命名",
          desc: "",
        })}
        titleKey="title"
        subtitleKey="desc"
        renderPreview={(p) => p.src}
      />
    </AdminPanel>
  );
}
