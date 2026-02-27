import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'FilledCard — Fill Your Dance Card',
  description: 'The social platform for competitive ballroom dancers. Build your profile, showcase competition history, find dance partners, and connect with professional teachers.',
  keywords: 'ballroom dancing, dance partner, Pro-Am, competitive ballroom, dance teacher',
  openGraph: {
    title: 'FilledCard — Fill Your Dance Card',
    description: 'Connect with the competitive ballroom dance community.',
    url: 'https://filledcard.com',
    siteName: 'FilledCard',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
