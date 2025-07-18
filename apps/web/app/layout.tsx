import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Up - Open Source Uptime Monitoring',
  description:
    'A better uptime monitoring solution. Alert on website downtime, DNS/TLS/Domain checks built in. Fully open source.',
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
        <Theme
          appearance="light"
          accentColor="gray"
          grayColor="gray"
          radius="none"
        >
          {children}
        </Theme>
      </body>
    </html>
  )
}
