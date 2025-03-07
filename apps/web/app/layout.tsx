import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'up.pem.sh',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <meta name="apple-mobile-web-app-title" content="Up" />
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  )
}
