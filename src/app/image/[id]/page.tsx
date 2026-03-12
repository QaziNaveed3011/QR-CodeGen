import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, ArrowLeft, CalendarDays, HardDrive, FileImage } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { getMetadata } from '@/lib/storage'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Metadata export ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const meta = await getMetadata(id)
  if (!meta) return { title: 'Image Not Found' }

  return {
    title: `${meta.originalName} — QRShare`,
    description: 'View this shared image on QRShare.',
    openGraph: {
      title: meta.originalName,
      description: 'Shared via QRShare',
      images: [{ url: meta.imageUrl, alt: meta.originalName }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.originalName,
      description: 'Shared via QRShare',
      images: [meta.imageUrl],
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function ImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meta = await getMetadata(id)
  if (!meta) notFound()

  const imageUrl = meta.imageUrl

  return (
    <>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm mb-8 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to upload
        </Link>

        {/* Image card */}
        <div className="glass-card rounded-3xl overflow-hidden mb-6">
          <div className="relative w-full bg-[#07031a]/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={meta.originalName}
              className="mx-auto max-h-[70vh] w-auto object-contain py-6 px-4"
            />
          </div>
        </div>

        {/* Meta + actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Info */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
              File Details
            </p>

            <InfoRow
              Icon={FileImage}
              label="Filename"
              value={meta.originalName}
            />
            <InfoRow
              Icon={HardDrive}
              label="Size"
              value={formatBytes(meta.size)}
            />
            <InfoRow
              Icon={CalendarDays}
              label="Uploaded"
              value={formatDate(meta.uploadedAt)}
            />
          </div>

          {/* Actions */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4">
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
              Actions
            </p>

            <a
              href={imageUrl}
              download={meta.originalName}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download Image
            </a>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium text-sm transition-all duration-200 active:scale-[0.98]"
            >
              Create Your Own QR
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 px-4 text-white/25 text-xs">
        QRShare — built with Next.js &amp; Tailwind CSS
      </footer>
    </>
  )
}

function InfoRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-white/40 text-xs mb-0.5">{label}</p>
        <p className="text-white/80 text-sm break-all">{value}</p>
      </div>
    </div>
  )
}
