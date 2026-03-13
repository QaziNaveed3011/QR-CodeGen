import Link from 'next/link'
import { QrCode } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass-light border-b border-white/[0.06]">
      <div className="container mx-auto px-4 max-w-6xl">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              QR<span className="text-gradient">Share</span>
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white text-sm transition-colors duration-200 hidden sm:block"
            >
              GitHub
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              New QR
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
