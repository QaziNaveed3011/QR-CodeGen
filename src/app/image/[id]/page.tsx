import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { getMetadata } from '@/lib/storage'

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

      <main className="flex-1 flex flex-col">
        {/* Full-width image viewer */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={meta.originalName}
            className="max-h-[82vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl"
          />
        </div>

        {/* Minimal bottom bar */}
        <div className="sticky bottom-0 glass-light border-t border-white/[0.06] py-3 px-6">
          <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
            {/* Filename */}
            <p className="text-white/50 text-sm truncate hidden sm:block">
              {meta.originalName}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                New QR
              </Link>

              <a
                href={imageUrl}
                download={meta.originalName}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.97]"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
