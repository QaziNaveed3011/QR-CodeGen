/**
 * Storage abstraction
 *
 * • Production / Vercel  → Vercel Blob  (when BLOB_READ_WRITE_TOKEN is set)
 * • Local development    → local filesystem under public/uploads & data/uploads
 *
 * This single module is the only place in the app that touches I/O, so swapping
 * the backend is a one-file change.
 */

import type { ImageMetadata } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN

// ── Image storage ─────────────────────────────────────────────────────────────

/**
 * Persist an image buffer and return its public-accessible URL.
 * Files are stored with unique names to prevent overwrites.
 */
export async function storeImage(
  filename: string,
  buffer: Buffer,
  mimetype: string,
): Promise<{ imageUrl: string; uniqueFilename: string }> {  // ← Changed return type
  // Generate unique ID for the file
  const uniqueId = uuidv4();
  const extension = filename.split('.').pop() || 'jpg';
  const uniqueFilename = `${uniqueId}.${extension}`;  // ← Use ID as filename
  const blobPath = `uploads/${uniqueFilename}`;

  if (USE_BLOB) {
    const { put } = await import('@vercel/blob')
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: mimetype,
      addRandomSuffix: false,  // We're handling uniqueness ourselves
    })
    return { 
      imageUrl: blob.url,
      uniqueFilename 
    };
  }

  // ── Local filesystem fallback ─────────────────────────────────────────────
  const { writeFile, mkdir } = await import('fs/promises')
  const { existsSync } = await import('fs')
  const { join } = await import('path')

  const dir = join(process.cwd(), 'public', 'uploads')
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  await writeFile(join(dir, uniqueFilename), buffer)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return { 
    imageUrl: `${baseUrl}/uploads/${uniqueFilename}`,
    uniqueFilename 
  };
}

// ── Metadata storage ──────────────────────────────────────────────────────────

/**
 * Persist image metadata. The metadata object stores the original filename
 * for display, but the image URL uses the unique filename.
 */
export async function storeMetadata(id: string, metadata: ImageMetadata): Promise<void> {
  const json = JSON.stringify(metadata, null, 2)

  if (USE_BLOB) {
    const { put } = await import('@vercel/blob')
    await put(`metadata/${id}.json`, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    return
  }

  // ── Local filesystem fallback ─────────────────────────────────────────────
  const { writeFile, mkdir } = await import('fs/promises')
  const { existsSync } = await import('fs')
  const { join } = await import('path')

  const dir = join(process.cwd(), 'data', 'uploads')
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  await writeFile(join(dir, `${id}.json`), json)
}

// ── Metadata retrieval ────────────────────────────────────────────────────────

/** Only allow safe URL slug characters to prevent path traversal */
const SLUG_RE = /^[a-z0-9][a-z0-9._-]{0,199}$/i

/**
 * Retrieve metadata by slug (the filename stem used as the URL path segment).
 * Returns `null` when the slug is invalid or no image was found.
 */
export async function getMetadata(slug: string): Promise<ImageMetadata | null> {
  if (!SLUG_RE.test(slug)) return null

  if (USE_BLOB) {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `metadata/${slug}.json` })
    if (!blobs.length) return null

    try {
      const res = await fetch(blobs[0].url, { cache: 'no-store' })
      if (!res.ok) return null
      return (await res.json()) as ImageMetadata
    } catch {
      return null
    }
  }

  // ── Local filesystem fallback ─────────────────────────────────────────────
  const { readFile } = await import('fs/promises')
  const { existsSync } = await import('fs')
  const { join } = await import('path')

  const metaPath = join(process.cwd(), 'data', 'uploads', `${slug}.json`)
  if (!existsSync(metaPath)) return null

  try {
    return JSON.parse(await readFile(metaPath, 'utf-8')) as ImageMetadata
  } catch {
    return null
  }
}
