import './globals.css'
import { Boogaloo, Inter } from 'next/font/google'

const boogaloo = Boogaloo({ subsets: ['latin'], weight: '400', variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata = {
  title: 'Mishear It!',
  description: 'Guess the real lyrics from the misheard version!',
  manifest: '/manifest.json',
  themeColor: '#FF2D6B',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${boogaloo.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF2D6B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
