"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  deleteVideoObject,
  getVideoUploadUrl,
} from "@/features/admin/actions/upload";
import { VideoUploader } from "@/features/admin/components/VideoUploader";

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea";
  listOf?: boolean;
  hidden?: boolean;
  videoUpload?: boolean;
};

type Row<T> = T & { _localKey?: string };

type PendingFile = { file: File; name: string; src: string };

type EditableItemListProps<T extends Record<string, unknown>> = {
  items: T[];
  fields: FieldConfig[];
  columns: string[];
  newItem: () => T;
  keyOf: (item: T) => string;
  onSave: (item: T) => Promise<{ error?: string }>;
  onDelete: (item: T) => Promise<{ error?: string }>;
};

const inputClass =
  "h-10 w-full rounded-xl border border-white/[.12] bg-zinc-900 px-3 text-sm outline-none transition-all duration-200 focus:border-blue-400/70 focus:bg-zinc-800 focus:ring-2 focus:ring-blue-500/20";

const textareaClass = cn(inputClass, "h-24 py-2.5");

const bodyCellClass = "px-3 py-2.5 align-middle";

function toFieldValue(field: FieldConfig, rawValue: string): unknown {
  if (field.listOf) {
    return rawValue
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return field.type === "number" ? Number(rawValue) : rawValue;
}

function toInputValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return value === undefined || value === null ? "" : String(value);
}

function putFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => resolve(xhr.status);
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(file);
  });
}

export function EditableItemList<T extends Record<string, unknown>>({
  items,
  fields,
  columns,
  newItem,
  keyOf,
  onSave,
  onDelete,
}: EditableItemListProps<T>) {
  const [newRows, setNewRows] = useState<Row<T>[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<T>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, PendingFile>>({});
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number | null>>({});

  const visibleFields = fields.filter((field) => !field.hidden);
  const videoFields = visibleFields.filter((field) => field.videoUpload);

  const rows: Row<T>[] = [
    ...newRows,
    ...items.map((item) => ({ ...item, ...edits[keyOf(item)] })),
  ];

  function updateValue(row: Row<T>, field: FieldConfig, rawValue: string) {
    const value = toFieldValue(field, rawValue);

    if (row._localKey) {
      setNewRows((prev) =>
        prev.map((candidate) =>
          candidate._localKey === row._localKey
            ? { ...candidate, [field.key]: value }
            : candidate,
        ),
      );
      return;
    }

    const key = keyOf(row as T);
    setEdits((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field.key]: value },
    }));
  }

  function fieldKey(row: Row<T>, field: FieldConfig): string {
    return `${rowKey(row)}:${field.key}`;
  }

  function dropPending(fKey: string) {
    setPendingFiles((prev) => {
      const entry = prev[fKey];
      if (entry) URL.revokeObjectURL(entry.src);
      const next = { ...prev };
      delete next[fKey];
      return next;
    });
    setUploadingKeys((prev) => {
      const next = { ...prev };
      delete next[fKey];
      return next;
    });
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[fKey];
      return next;
    });
  }

  function selectFile(row: Row<T>, field: FieldConfig, file: File) {
    const fKey = fieldKey(row, field);
    setPendingFiles((prev) => {
      const previous = prev[fKey];
      if (previous) URL.revokeObjectURL(previous.src);
      return { ...prev, [fKey]: { file, name: file.name, src: URL.createObjectURL(file) } };
    });
    setErrors((prev) => ({ ...prev, [rowKey(row)]: "" }));
  }

  async function cleanupRemovedVideos(original: Row<T>, finalRow: T) {
    for (const field of videoFields) {
      const before = (original as Record<string, unknown>)[field.key];
      const after = (finalRow as Record<string, unknown>)[field.key];
      if (typeof before === "string" && before && before !== after) {
        await deleteVideoObject(before);
      }
    }
  }

  async function save(row: Row<T>) {
    const key = rowKey(row);
    setPending((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: "" }));

    let finalRow = row as T;
    const merged: Record<string, unknown> = {};

    for (const field of videoFields) {
      const fKey = fieldKey(row, field);
      const pendingFile = pendingFiles[fKey] ?? null;
      if (!pendingFile) continue;

      setUploadingKeys((prev) => ({ ...prev, [fKey]: true }));
      setUploadProgress((prev) => ({ ...prev, [fKey]: 0 }));

      const signed = await getVideoUploadUrl(
        pendingFile.file.name,
        pendingFile.file.type,
      );
      if (signed.error || !signed.uploadUrl || !signed.publicUrl) {
        setErrors((prev) => ({
          ...prev,
          [key]: signed.error ?? "No se pudo iniciar la subida.",
        }));
        setUploadingKeys((prev) => ({ ...prev, [fKey]: false }));
        setPending((prev) => ({ ...prev, [key]: false }));
        return;
      }

      try {
        const status = await putFile(
          signed.uploadUrl,
          pendingFile.file,
          (percent) =>
            setUploadProgress((prev) => ({ ...prev, [fKey]: percent })),
        );
        if (status < 200 || status >= 300) {
          setErrors((prev) => ({
            ...prev,
            [key]: `La subida falló (código ${status}).`,
          }));
          setUploadingKeys((prev) => ({ ...prev, [fKey]: false }));
          setPending((prev) => ({ ...prev, [key]: false }));
          return;
        }
        merged[field.key] = signed.publicUrl;
      } catch {
        setErrors((prev) => ({
          ...prev,
          [key]: "Ocurrió un error al subir el video.",
        }));
        setUploadingKeys((prev) => ({ ...prev, [fKey]: false }));
        setPending((prev) => ({ ...prev, [key]: false }));
        return;
      }
    }

    if (Object.keys(merged).length > 0) {
      finalRow = { ...row, ...merged };
    }

    const result = await onSave(finalRow);
    setPending((prev) => ({ ...prev, [key]: false }));

    if (result.error) {
      setErrors((prev) => ({ ...prev, [key]: result.error ?? "" }));
      return;
    }

    if (row._localKey) {
      setNewRows((prev) =>
        prev.filter((candidate) => candidate._localKey !== row._localKey),
      );
    } else {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setEditing((prev) => ({ ...prev, [key]: false }));
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));

    for (const field of videoFields) {
      dropPending(fieldKey(row, field));
    }

    if (!row._localKey) {
      const original = items.find(
        (item) => keyOf(item as T) === keyOf(row as T),
      ) as Row<T> | undefined;
      if (original) {
        await cleanupRemovedVideos(original, finalRow);
      }
    }
  }

  async function remove(row: Row<T>) {
    if (row._localKey) {
      setNewRows((prev) =>
        prev.filter((candidate) => candidate._localKey !== row._localKey),
      );
      return;
    }

    const key = rowKey(row);
    const original = items.find(
      (item) => keyOf(item as T) === keyOf(row as T),
    ) as Row<T> | undefined;

    setPending((prev) => ({ ...prev, [key]: true }));
    const result = await onDelete(row as T);
    setPending((prev) => ({ ...prev, [key]: false }));

    if (result.error) {
      setErrors((prev) => ({ ...prev, [key]: result.error ?? "" }));
      return;
    }

    if (original) {
      for (const field of videoFields) {
        const value = (original as Record<string, unknown>)[field.key];
        if (typeof value === "string" && value) {
          await deleteVideoObject(value);
        }
      }
    }
  }

  function cancel(row: Row<T>) {
    const key = rowKey(row);
    for (const field of videoFields) {
      dropPending(fieldKey(row, field));
    }
    if (row._localKey) {
      setNewRows((prev) =>
        prev.filter((candidate) => candidate._localKey !== row._localKey),
      );
    } else {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setEditing((prev) => ({ ...prev, [key]: false }));
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function addNew() {
    const localKey = Math.random().toString(36).slice(2);
    setNewRows((prev) => [{ ...newItem(), _localKey: localKey }, ...prev]);
    setEditing((prev) => ({ ...prev, [localKey]: true }));
  }

  function rowKey(row: Row<T>): string {
    return row._localKey ?? keyOf(row as T);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-black/[.08] dark:border-white/[.12]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/[.08] bg-zinc-50 dark:border-white/[.12] dark:bg-zinc-900">
            <tr>
              {columns.map((column) => {
                const field = fields.find((candidate) => candidate.key === column);
                return (
                  <th
                    key={column}
                    scope="col"
                    className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    {field?.label ?? column}
                  </th>
                );
              })}
              <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[.06] dark:divide-white/[.08]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-sm text-zinc-500">
                  Sin registros.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = rowKey(row);
                const isEditing = editing[key];
                const isPending = pending[key];
                const error = errors[key];

                return (
                  <tr
                    key={key}
                    className={cn(
                      "transition-colors duration-200 hover:bg-white/[.02]",
                      isEditing && "bg-zinc-900/40",
                    )}
                  >
                    {isEditing ? (
                      <td colSpan={columns.length + 1} className="animate-scale-in p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {visibleFields.map((field) => (
                            <label
                              key={field.key}
                              className={cn(
                                "flex flex-col gap-1.5 text-xs font-medium",
                                field.type === "textarea" && "sm:col-span-2",
                              )}
                            >
                              {field.label}
                              {field.videoUpload ? (
                                <VideoUploader
                                  value={toInputValue(row[field.key])}
                                  pending={pendingFiles[fieldKey(row, field)] ?? null}
                                  uploading={!!uploadingKeys[fieldKey(row, field)]}
                                  progress={uploadProgress[fieldKey(row, field)] ?? null}
                                  error={error}
                                  onSelect={(file) => selectFile(row, field, file)}
                                  onClearPending={() =>
                                    dropPending(fieldKey(row, field))
                                  }
                                  onRemoveValue={() => updateValue(row, field, "")}
                                />
                              ) : field.type === "textarea" ? (
                                <textarea
                                  value={toInputValue(row[field.key])}
                                  onChange={(event) =>
                                    updateValue(row, field, event.target.value)
                                  }
                                  className={textareaClass}
                                />
                              ) : (
                                <input
                                  type={field.type ?? "text"}
                                  value={toInputValue(row[field.key])}
                                  onChange={(event) =>
                                    updateValue(row, field, event.target.value)
                                  }
                                  className={inputClass}
                                />
                              )}
                            </label>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => save(row)}
                            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-all duration-200 hover:bg-zinc-100 active:scale-[0.97] disabled:opacity-50"
                          >
                            {isPending ? "Guardando…" : "Guardar"}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => cancel(row)}
                            className="rounded-full border border-white/[.12] px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-blue-400/40 hover:bg-white/[.06] disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => remove(row)}
                            className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-950 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                          {error ? (
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                          ) : null}
                        </div>
                      </td>
                    ) : (
                      <>
                        {columns.map((column) => (
                          <td key={column} className={cn(bodyCellClass, "max-w-64 truncate")}>
                            {toInputValue(row[column])}
                          </td>
                        ))}
                        <td className={cn(bodyCellClass, "text-right")}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditing((prev) => ({ ...prev, [key]: true }))
                              }
                              className="rounded-full border border-white/[.12] px-3 py-1 text-xs font-medium text-zinc-200 transition-all duration-200 hover:border-blue-400/40 hover:bg-white/[.06]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => remove(row)}
                              className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-950 disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addNew}
        className="self-start rounded-full border border-white/[.12] px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-blue-400/40 hover:bg-white/[.06]"
      >
        + Agregar
      </button>
    </div>
  );
}