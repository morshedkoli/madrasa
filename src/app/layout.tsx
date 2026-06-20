import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'মাদ্রাসা ম্যানেজমেন্ট সিস্টেম',
  description: 'প্রাথমিক স্তরের ইসলামিক শিক্ষা প্রতিষ্ঠানের জন্য আধুনিক ডিজিটাল ব্যবস্থাপনা — শিক্ষার্থী, শিক্ষক ও আর্থিক পরিচালনা এক প্ল্যাটফর্মে।',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Anek+Bangla:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
