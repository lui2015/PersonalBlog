"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Field,
  inputClass,
  textareaClass,
  btnPrimary,
  btnGhost,
  btnDanger,
} from "./AdminPanel";
import ImageUploader from "./ImageUploader";

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "textarea" | "number" | "image";
  placeholder?: string;
  hint?: string;
  /** 1 表示占满整行（grid col-span-2） */
  span?: 1 | 2;
  /** image 类型形状 */
  imageShape?: "rect" | "circle";
}

interface Props<T extends { id: string }> {
  items: T[];
  fields: FieldDef<T>[];
  onChange: (next: T[]) => void;
  /** 创建新条目时的默认值（不含 id） */
  createDefault: () => Omit<T, "id">;
  /** 在卡片上额外渲染的预览内容 */
  renderPreview?: (item: T) => React.ReactNode;
  /** 用于卡片标题展示的字段，默认是 fields[0].key */
  titleKey?: keyof T & string;
  /** 子标题字段，如作者 */
  subtitleKey?: keyof T & string;
}

export default function ItemListEditor<T extends { id: string }>({
  items,
  fields,
  onChange,
  createDefault,
  renderPreview,
  titleKey,
  subtitleKey,
}: Props<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<T | null>(null);

  // 当外部 items 改变时，如果当前编辑的项目消失则关闭
  useEffect(() => {
    if (editingId && !items.find((i) => i.id === editingId)) {
      setEditingId(null);
      setDraft(null);
    }
  }, [items, editingId]);

  const startCreate = () => {
    const next = { ...createDefault(), id: `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` } as T;
    setEditingId(next.id);
    setDraft(next);
    // 立即添加到列表底部，方便保存即可见；如果取消则移除
    onChange([...items, next]);
  };

  const startEdit = (item: T) => {
    setEditingId(item.id);
    setDraft({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    onChange(items.map((i) => (i.id === draft.id ? draft : i)));
    setEditingId(null);
    setDraft(null);
  };

  const removeItem = (id: string) => {
    if (!confirm("确认删除该条目？")) return;
    onChange(items.filter((i) => i.id !== id));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const titleK = (titleKey ?? fields[0]?.key) as keyof T & string;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
          // 共 {items.length} 项
        </p>
        <button onClick={startCreate} className={btnPrimary}>
          + 新增
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const isEditing = editingId === item.id && draft;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="cyber-card p-4"
              >
                {isEditing ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((f) => {
                        const value = (draft as T)[f.key] as unknown;
                        const colSpan = f.span === 1 ? "md:col-span-2" : "";
                        return (
                          <div key={f.key} className={colSpan}>
                            <Field label={f.label} hint={f.hint}>
                              {f.type === "textarea" ? (
                                <textarea
                                  value={String(value ?? "")}
                                  onChange={(e) =>
                                    setDraft({
                                      ...(draft as T),
                                      [f.key]: e.target.value,
                                    } as T)
                                  }
                                  className={textareaClass}
                                  placeholder={f.placeholder}
                                  rows={4}
                                />
                              ) : f.type === "number" ? (
                                <input
                                  type="number"
                                  value={String(value ?? "")}
                                  onChange={(e) =>
                                    setDraft({
                                      ...(draft as T),
                                      [f.key]: Number(e.target.value),
                                    } as T)
                                  }
                                  className={inputClass}
                                  placeholder={f.placeholder}
                                />
                              ) : f.type === "image" ? (
                                <ImageUploader
                                  value={String(value ?? "")}
                                  onChange={(v) =>
                                    setDraft({
                                      ...(draft as T),
                                      [f.key]: v,
                                    } as T)
                                  }
                                  shape={f.imageShape ?? "rect"}
                                  placeholder={f.placeholder}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={String(value ?? "")}
                                  onChange={(e) =>
                                    setDraft({
                                      ...(draft as T),
                                      [f.key]: e.target.value,
                                    } as T)
                                  }
                                  className={inputClass}
                                  placeholder={f.placeholder}
                                />
                              )}
                            </Field>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={cancelEdit} className={btnGhost}>
                        取消
                      </button>
                      <button onClick={saveEdit} className={btnPrimary}>
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] pt-1 w-6 text-right shrink-0">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h4 className="text-base text-gray-200 font-medium truncate">
                          {String((item as T)[titleK] ?? "(无标题)")}
                        </h4>
                        {subtitleKey && (
                          <span className="text-xs text-gray-500">
                            {String((item as T)[subtitleKey] ?? "")}
                          </span>
                        )}
                      </div>
                      {renderPreview && (
                        <div className="mt-2 text-xs text-gray-500 line-clamp-2 whitespace-pre-line">
                          {renderPreview(item)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className={`${btnGhost} disabled:opacity-30 disabled:cursor-not-allowed`}
                        title="上移"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                        className={`${btnGhost} disabled:opacity-30 disabled:cursor-not-allowed`}
                        title="下移"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className={btnGhost}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={btnDanger}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm font-[family-name:var(--font-mono)]">
            // 暂无数据，点击右上角「新增」开始创建
          </div>
        )}
      </div>
    </div>
  );
}
