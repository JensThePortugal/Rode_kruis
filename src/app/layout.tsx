import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Nav } from '@/components/Nav'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Het Oranje Kruis – EHBO Quiz',
  description: 'Live multiplayer EHBO-quiz voor Het Oranje Kruis trainingen.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col hok-pattern">
        <Nav />
        {children}
      </body>
    </html>
  )
}
