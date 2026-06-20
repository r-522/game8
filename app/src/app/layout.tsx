import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '喧嘩番長7 ～波嵐烈伝～',
  description: '波嵐市を舞台にした本格3Dブラウザアクションゲーム。メンチ・タンカ・喧嘩バトルで波嵐制覇祭の頂点を目指せ。',
  keywords: ['喧嘩番長', 'アクションゲーム', '不良', 'ブラウザゲーム', '3D'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-black overflow-hidden w-screen h-screen">
        {children}
      </body>
    </html>
  )
}
