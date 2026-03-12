export interface ImageMetadata {
  id: string
  originalName: string
  filename: string
  /** Fully-resolved public URL to the image (blob URL in prod, absolute local URL in dev) */
  imageUrl: string
  mimetype: string
  size: number
  uploadedAt: string
}

export interface UploadResponse {
  id: string
  filename: string
  imageUrl: string
  imagePageUrl: string
  metadata: ImageMetadata
}

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; data: UploadResponse }
  | { status: 'error'; message: string }
