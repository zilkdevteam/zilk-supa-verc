import { Inter } from 'next/font/google'
import './globals.css'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Zilk - Local Deals & Rewards',
  description: 'Discover amazing local deals with our innovative spin-to-win platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-retro-light">
          {children}
        </div>
        <CookieConsent />
      </body>
    </html>
  )
}
