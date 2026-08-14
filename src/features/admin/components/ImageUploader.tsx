"use client";

type PendingSelection = { name: string; src: string };

type ImageUploaderProps = {
  value: string;
  pending: PendingSelection | null;
  uploading: boolean;
  progress: number | null;
  error: string | null;
  onSelect: (file: File) => void;
  onClearPending: () => void;
  onRemoveValue: () => void;
};

export function ImageUploader({
  value,
  pending,
  uploading,
  progress,
  error,
  onSelect,
  onClearPending,
  onRemoveValue,
}: ImageUploaderProps) {
  const previewSrc = pending?.src ?? value;

  return (
    <div className="flex flex-col gap-2">
      {previewSrc ? (
        <img
          src={previewSrc}
          alt="Vista previa"
          className="max-h-48 w-auto self-start rounded-xl bg-zinc-950 object-contain"
        />
      ) : null}

      {pending ? (
        <p className="text-xs text-zinc-500">
          Se subirá al guardar: {pending.name}
          {uploading && progress !== null ? ` (${progress}%)` : ""}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
          }}
          className="text-xs text-zinc-500 file:mr-2 file:rounded-full file:border file:border-white/[.12] file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200 file:transition-all file:duration-200 hover:file:border-blue-400/40 hover:file:bg-white/[.06]"
        />

        {pending ? (
          <button
            type="button"
            disabled={uploading}
            onClick={onClearPending}
            className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-950 disabled:opacity-50"
          >
            Quitar selección
          </button>
        ) : value ? (
          <button
            type="button"
            onClick={onRemoveValue}
            className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-950 disabled:opacity-50"
          >
            Quitar imagen
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}