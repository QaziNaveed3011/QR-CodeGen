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

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN

// ── Image storage ─────────────────────────────────────────────────────────────

/**
 * Persist an image buffer and return its public-accessible URL.
 * @param filename  Final sanitized filename (including extension) to store under.
 */
export async function storeImage(
  filename: string,
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob')
    const blob = await put(`uploads/${filename}`, buffer, {
      access: 'public',
      contentType: mimetype,
      addRandomSuffix: false,
    })
    return blob.url
  }

  // ── Local filesystem fallback ─────────────────────────────────────────────
  const { writeFile, mkdir } = await import('fs/promises')
  const { existsSync } = await import('fs')
  const { join } = await import('path')

  const dir = join(process.cwd(), 'public', 'uploads')
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), buffer)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return `${baseUrl}/uploads/${filename}`
}

// ── Metadata storage ──────────────────────────────────────────────────────────

/**
 * Persist image metadata. The metadata object itself stores the image URL so
 * the display page never has to reconstruct it.
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

/** UUID v4 regex — used to validate route params before any I/O */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Retrieve metadata by image ID.
 * Returns `null` when the ID is invalid or the image does not exist.
 */
export async function getMetadata(id: string): Promise<ImageMetadata | null> {
  if (!UUID_RE.test(id)) return null

  if (USE_BLOB) {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `metadata/${id}.json` })
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

  const metaPath = join(process.cwd(), 'data', 'uploads', `${id}.json`)
  if (!existsSync(metaPath)) return null

  try {
    return JSON.parse(await readFile(metaPath, 'utf-8')) as ImageMetadata
  } catch {
    return null
  }
}
