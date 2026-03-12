'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, ShieldCheck, Globe } from 'lucide-react'
import Navbar from '@/components/Navbar'
import UploadZone from '@/components/UploadZone'
import ResultCard from '@/components/ResultCard'
import type { UploadResponse, UploadState } from '@/types'

// ── Feature highlights ───────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Zap,
    title: 'Instant QR Code',
    desc: 'Generated the moment your image lands on the server.',
  },
  {
    Icon: ShieldCheck,
    title: 'Secure Storage',
    desc: 'Every image gets a unique ID — no guessable URLs.',
  },
  {
    Icon: Globe,
    title: 'Scan from Anywhere',
    desc: 'Works on any device with a camera — no app needed.',
  },
] as const

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  const handleUpload = useCallback(async (file: File) => {
    setState({ status: 'uploading' })

    try {
      const form = new FormData()
      form.append('image', file)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Upload failed.')

      setState({ status: 'success', data: json as UploadResponse })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      })
    }
  }, [])

  const handleReset = useCallback(() => setState({ status: 'idle' }), [])

  const isIdle = state.status === 'idle' || state.status === 'error'
  const isResult = state.status === 'success'

  return (
    <>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* ── Hero ──────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
          aria-label="hero"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-600/15 border border-brand-500/25 rounded-full px-4 py-1.5 mb-5 sm:mb-7">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" aria-hidden />
            <span className="text-brand-300 text-xs font-semibold tracking-wide uppercase">
              Upload · Generate · Share
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight mb-3 sm:mb-5">
            Your image,
            <br />
            <span className="text-gradient">one QR away.</span>
          </h1>

          <p className="text-white/55 text-sm sm:text-xl max-w-xl mx-auto leading-relaxed">
            Upload any image and instantly get a QR code. Share it — anyone who
            scans it lands right on your image.
          </p>
        </motion.section>

        {/* ── Upload / Result area ──────────────────────────── */}
        <AnimatePresence mode="wait">
          {isResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <ResultCard data={state.data} onReset={handleReset} />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <UploadZone
                onUpload={handleUpload}
                isUploading={state.status === 'uploading'}
                error={state.status === 'error' ? state.message : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Feature cards (idle only) ─────────────────────── */}
        <AnimatePresence>
          {isIdle && (
            <motion.section
              key="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-14"
              aria-label="features"
            >
              {FEATURES.map(({ Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className="glass-card rounded-2xl p-6 flex flex-col items-center text-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-600/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-400" aria-hidden />
                  </div>
                  <h3 className="text-white font-semibold text-sm">{title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="text-center py-8 px-4 text-white/25 text-xs">
        QRShare — built with Next.js &amp; Tailwind CSS
      </footer>
    </>
  )
}
