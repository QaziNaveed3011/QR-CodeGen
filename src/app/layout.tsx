import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'QR Image Share — Upload & Share Images via QR Code',
  description:
    'Upload any image and instantly generate a QR code. Share it with anyone — they scan it, they see your image.',
  keywords: ['qr code', 'image upload', 'image sharing', 'qr generator'],
  openGraph: {
    title: 'QR Image Share',
    description: 'Upload images and generate shareable QR codes instantly.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {/* Ambient blobs — purely decorative */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-teal-700/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-cyan-800/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
