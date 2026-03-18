export interface ImageMetadata {
  id: string
  originalName: string
  filename: string
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