import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'My App'

export const metadata: Metadata = {
  title: projectName,
  description: `${projectName} - Built with Next.js and Supabase`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
