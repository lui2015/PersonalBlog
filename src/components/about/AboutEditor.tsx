"use client";

import { useRef, useState } from "react";
import type { AboutContent, AboutSkill, AboutSocialLink, AboutTimelineItem } from "@/lib/types";
import { Field, inputClass, textareaClass, btnGhost, btnDanger } from "@/components/admin/AdminPanel";

const newId = (p: string) => `${p}${Date.now()}${Math.floor(Math.random() * 1000)}`;

/** 图片上传：走 /api/upload，返回可直接访问的 URL */
async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.ok && data.url) return data.url as string;
    alert(`上传失败：${data.error || "未知错误"}`);
  } catch (e) {
    alert(`上传出错：${e instanceof Error ? e.message : String(e)}`);
  }
  return null;
}

export default function AboutEditor({
  value,
  onChange,
}: {
  value: AboutContent;
  onChange: (v: AboutContent) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadingSkillId, setUploadingSkillId] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<AboutContent>) => onChange({ ...value, ...p });

  const updateLink = (id: string, p: Partial<AboutSocialLink>) =>
    patch({
      socialLinks: value.socialLinks.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });

  const updateTimeline = (id: string, p: Partial<AboutTimelineItem>) =>
    patch({
      timeline: value.timeline.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });

  const updateSkill = (id: string, p: Partial<AboutSkill>) =>
    patch({
      skillTree: value.skillTree.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });

  const moveSkill = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.skillTree.length) return;
    const next = [...value.skillTree];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ skillTree: next });
  };

  const handleCertificate = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || uploadingSkillId) return;
    setUploadingSkillId(id);
    const url = await uploadImage(file);
    if (url) updateSkill(id, { certificate: url });
    setUploadingSkillId(null);
    e.target.value = "";
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) patch({ avatar: url });
    setUploading(false);
    if (avatarRef.current) avatarRef.current.value = "";
  };

  return (
    <div className="space-y-7">
      {/* 基本资料 */}
      <section>
        <h4 className="text-xs text-cyber-blue mb-3 font-[family-name:var(--font-mono)] tracking-widest">
          [PROFILE] 基本资料
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="姓名">
            <input
              value={value.name}
              onChange={(e) => patch({ name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="职位 / 头衔">
            <input
              value={value.role}
              onChange={(e) => patch({ role: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="个人简介">
              <textarea
                value={value.bio}
                onChange={(e) => patch({ bio: e.target.value })}
                className={textareaClass}
                rows={4}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="头像图片" hint="可粘贴图片 URL，或点击上传本地图片">
              <div className="flex items-center gap-3">
                {value.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value.avatar}
                    alt="头像预览"
                    className="w-16 h-16 object-cover rounded border border-cyber-border"
                  />
                )}
                <input
                  value={value.avatar}
                  onChange={(e) => patch({ avatar: e.target.value })}
                  className={inputClass}
                  placeholder="/images/avatar.jpg 或 https://..."
                />
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  disabled={uploading}
                  className={`${btnGhost} shrink-0 disabled:opacity-50`}
                >
                  {uploading ? "上传中..." : "📷 上传"}
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleAvatar}
                  className="hidden"
                />
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* 社交链接 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs text-cyber-blue font-[family-name:var(--font-mono)] tracking-widest">
            [SOCIAL] 社交链接（{value.socialLinks.length}）
          </h4>
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                socialLinks: [
                  ...value.socialLinks,
                  { id: newId("as"), name: "", url: "", icon: "🔗" },
                ],
              })
            }
          >
            + 新增
          </button>
        </div>
        <div className="space-y-2">
          {value.socialLinks.map((link) => (
            <div key={link.id} className="flex flex-wrap items-center gap-2">
              <input
                value={link.icon}
                onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                className={`${inputClass} w-20 shrink-0 text-center`}
                placeholder="图标"
              />
              <input
                value={link.name}
                onChange={(e) => updateLink(link.id, { name: e.target.value })}
                className={`${inputClass} w-32 shrink-0`}
                placeholder="名称"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                className={`${inputClass} flex-1 min-w-[160px]`}
                placeholder="链接 URL"
              />
              <button
                type="button"
                className={btnDanger}
                onClick={() =>
                  patch({ socialLinks: value.socialLinks.filter((x) => x.id !== link.id) })
                }
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 技能树 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs text-cyber-purple font-[family-name:var(--font-mono)] tracking-widest">
            [SKILL TREE] 技能标签（{value.skillTree.length}）
          </h4>
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                skillTree: [
                  ...value.skillTree,
                  { id: newId("sk"), name: "", certificate: "" },
                ],
              })
            }
          >
            + 新增
          </button>
        </div>
        <p className="text-[11px] text-gray-600 mb-2">
          每项可单独编辑名称并上传证书图片；前台点击带证书的标签可查看大图
        </p>
        <div className="space-y-2">
          {value.skillTree.map((skill, i) => (
            <div
              key={skill.id}
              className="p-3 rounded border border-cyber-border/60 bg-cyber-black/30 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-gray-600 font-[family-name:var(--font-mono)] w-5 shrink-0">
                  {i + 1}
                </span>
                <input
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                  className={`${inputClass} flex-1 min-w-[140px]`}
                  placeholder="技能 / 证书名称"
                />
                {skill.certificate && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={skill.certificate}
                      alt={`${skill.name} 证书预览`}
                      title="证书预览"
                      className="w-9 h-9 object-cover rounded border border-cyber-border shrink-0"
                    />
                  </>
                )}
                <label className={`${btnGhost} shrink-0 cursor-pointer`}>
                  {uploadingSkillId === skill.id
                    ? "上传中..."
                    : skill.certificate
                      ? "📷 更换证书"
                      : "📷 上传证书"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleCertificate(skill.id, e)}
                  />
                </label>
                {skill.certificate && (
                  <button
                    type="button"
                    className={`${btnGhost} shrink-0`}
                    onClick={() => updateSkill(skill.id, { certificate: "" })}
                  >
                    清除
                  </button>
                )}
                <button
                  type="button"
                  className={`${btnGhost} shrink-0 disabled:opacity-40`}
                  disabled={i === 0}
                  onClick={() => moveSkill(i, -1)}
                  title="上移"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={`${btnGhost} shrink-0 disabled:opacity-40`}
                  disabled={i === value.skillTree.length - 1}
                  onClick={() => moveSkill(i, 1)}
                  title="下移"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() =>
                    patch({
                      skillTree: value.skillTree.filter((x) => x.id !== skill.id),
                    })
                  }
                >
                  删除
                </button>
              </div>
              <input
                value={skill.certificate}
                onChange={(e) =>
                  updateSkill(skill.id, { certificate: e.target.value })
                }
                className={`${inputClass} text-[11px]`}
                placeholder="证书图片 URL（上传后自动填入，也可直接粘贴）"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 履历时间线 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs text-cyber-green font-[family-name:var(--font-mono)] tracking-widest">
            [TIMELINE] 履历（{value.timeline.length}）
          </h4>
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              patch({
                timeline: [
                  ...value.timeline,
                  { id: newId("at"), year: "", title: "", desc: "" },
                ],
              })
            }
          >
            + 新增
          </button>
        </div>
        <div className="space-y-2">
          {value.timeline.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2">
              <input
                value={item.year}
                onChange={(e) => updateTimeline(item.id, { year: e.target.value })}
                className={`${inputClass} w-20 shrink-0`}
                placeholder="年份"
              />
              <input
                value={item.title}
                onChange={(e) => updateTimeline(item.id, { title: e.target.value })}
                className={`${inputClass} w-40 shrink-0`}
                placeholder="标题"
              />
              <input
                value={item.desc}
                onChange={(e) => updateTimeline(item.id, { desc: e.target.value })}
                className={`${inputClass} flex-1 min-w-[160px]`}
                placeholder="描述"
              />
              <button
                type="button"
                className={btnDanger}
                onClick={() =>
                  patch({ timeline: value.timeline.filter((x) => x.id !== item.id) })
                }
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
