import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@supabase/supabase-js'
import { Analytics } from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Zilk - Local Deals & Rewards',
  description: 'Discover amazing local deals and spin to win exclusive rewards!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
