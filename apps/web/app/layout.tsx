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
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  )
}
