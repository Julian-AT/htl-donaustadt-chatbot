import { Metadata, Viewport } from 'next'

import { Toaster } from 'react-hot-toast'

import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { siteConfig } from '@/config/config'
import { Analytics } from '@vercel/analytics/react'

export const runtime = 'edge' // 'nodejs' (default) | 'edge'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
  userScalable: false,
  colorScheme: 'dark light'
}

export const metadata: Metadata = {
  title: {
    default: 'HTL Donaustadt - Chatbot',
    template: `%s - HTL Donaustadt Chatbot`
  },
  description: 'HTL Donaustadt - AI Chatbot',
  keywords: [
    'Next.js',
    'HTL Donaustadt',
    'HTL22',
    'Vercel AI SDK',
    'LangchainJS'
  ],
  authors: [
    {
      name: 'julian-at',
      url: 'https://github.com/julian-at/'
    }
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.png`],
    creator: '@julian-at'
  },
  creator: 'julian-at',
  icons: {
    icon: '/favicon.ico'
  },
  manifest: `${siteConfig.url}/site.webmanifest`
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <div className="flex flex-col min-h-screen">
            {/* @ts-ignore */}
            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
