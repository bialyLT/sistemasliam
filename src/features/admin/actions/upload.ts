"use server";

import { createHash, randomBytes } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isAdminSession } from "@/features/admin/services/guard";

export type UploadVideoResult = {
  uploadUrl?: string;
  publicUrl?: string;
  error?: string;
};

const ACCEPTED_EXTENSIONS = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".m4v", "video/mp4"],
]);

const ACCEPTED_IMAGE_EXTENSIONS = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
]);

const CACHE_HEADERS = "public, max-age=31536000, immutable";

function getConfig():
  | { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string; publicUrl: string }
  | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } =
    process.env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_URL
  ) {
    return null;
  }
  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
  };
}

export async function getVideoUploadUrl(
  filename: string,
  contentType: string,
): Promise<UploadVideoResult> {
  if (!(await isAdminSession())) {
    return { error: "Sesión expirada. Volvé a ingresar." };
  }

  const config = getConfig();
  if (!config) {
    return {
      error:
        "Cloudflare R2 no está configurado. Cargá R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y R2_PUBLIC_URL en .env.local.",
    };
  }

  const cleanName = filename.toLowerCase().trim();
  const knownType = [...ACCEPTED_EXTENSIONS.entries()].find(([ext]) =>
    cleanName.endsWith(ext),
  );
  if (!knownType) {
    return { error: "El archivo tiene que ser MP4, WebM, MOV o M4V." };
  }

  const extension = knownType[0];
  const expectedType = knownType[1];
  const actualType = contentType || "";
  if (actualType && !actualType.startsWith("video/")) {
    return { error: "El archivo elegido no parece un video." };
  }

  const key = `portfolio/videos/${createHash("sha1")
    .update(randomBytes(8).toString("hex"))
    .digest("hex")
    .slice(0, 16)}${extension}`;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: expectedType,
        CacheControl: CACHE_HEADERS,
      }),
      { expiresIn: 900 },
    );

    return {
      uploadUrl,
      publicUrl: `${config.publicUrl}/${key}`,
    };
  } catch (error) {
    console.error("[upload] signUrl failed:", error);
    return { error: "No se pudo generar la URL de subida." };
  }
}

export async function deleteVideoObject(
  videoUrl: string,
): Promise<{ error?: string }> {
  if (!videoUrl) return {};
  if (!(await isAdminSession())) {
    return { error: "Sesión expirada. Volvé a ingresar." };
  }

  const config = getConfig();
  if (!config) return { error: "R2 no está configurado." };

  let target: URL;
  try {
    target = new URL(videoUrl);
  } catch {
    return { error: "La URL del video no es válida." };
  }

  if (target.host !== new URL(config.publicUrl).host) {
    return { error: "El video no pertenece a este bucket." };
  }

  const path = target.pathname.replace(/^\//, "");
  if (!/^portfolio\/videos\/[^/]+$/.test(path)) {
    return { error: "Ruta de video inválida." };
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: path }),
    );
    return {};
  } catch (error) {
    console.error("[upload] delete failed:", error);
    return { error: "No se pudo eliminar el video." };
  }
}

export async function getImageUploadUrl(
  filename: string,
  contentType: string,
): Promise<UploadVideoResult> {
  if (!(await isAdminSession())) {
    return { error: "Sesión expirada. Volvé a ingresar." };
  }

  const config = getConfig();
  if (!config) {
    return {
      error:
        "Cloudflare R2 no está configurado. Cargá R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y R2_PUBLIC_URL en .env.local.",
    };
  }

  const cleanName = filename.toLowerCase().trim();
  const knownType = [...ACCEPTED_IMAGE_EXTENSIONS.entries()].find(([ext]) =>
    cleanName.endsWith(ext),
  );
  if (!knownType) {
    return { error: "El archivo tiene que ser JPG, PNG, WebP o GIF." };
  }

  const extension = knownType[0];
  const expectedType = knownType[1];
  const actualType = contentType || "";
  if (actualType && !actualType.startsWith("image/")) {
    return { error: "El archivo elegido no parece una imagen." };
  }

  const key = `portfolio/images/${createHash("sha1")
    .update(randomBytes(8).toString("hex"))
    .digest("hex")
    .slice(0, 16)}${extension}`;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: expectedType,
        CacheControl: CACHE_HEADERS,
      }),
      { expiresIn: 900 },
    );

    return {
      uploadUrl,
      publicUrl: `${config.publicUrl}/${key}`,
    };
  } catch (error) {
    console.error("[upload] signUrl failed:", error);
    return { error: "No se pudo generar la URL de subida." };
  }
}

export async function deleteImageObject(
  imageUrl: string,
): Promise<{ error?: string }> {
  if (!imageUrl) return {};
  if (!(await isAdminSession())) {
    return { error: "Sesión expirada. Volvé a ingresar." };
  }

  const config = getConfig();
  if (!config) return { error: "R2 no está configurado." };

  let target: URL;
  try {
    target = new URL(imageUrl);
  } catch {
    return { error: "La URL de la imagen no es válida." };
  }

  if (target.host !== new URL(config.publicUrl).host) {
    return { error: "La imagen no pertenece a este bucket." };
  }

  const path = target.pathname.replace(/^\//, "");
  if (!/^portfolio\/images\/[^/]+$/.test(path)) {
    return { error: "Ruta de imagen inválida." };
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: path }),
    );
    return {};
  } catch (error) {
    console.error("[upload] delete image failed:", error);
    return { error: "No se pudo eliminar la imagen." };
  }
}