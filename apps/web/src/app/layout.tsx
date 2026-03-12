import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CryptoRadar VN — Theo dõi crypto toàn diện',
  description: 'Công cụ theo dõi crypto toàn diện — danh mục, cảnh báo, whale alert, sentiment — cho nhà đầu tư Việt Nam',
  keywords: 'crypto, bitcoin, ethereum, danh mục crypto, cảnh báo giá, whale alert, việt nam',
  openGraph: {
    title: 'CryptoRadar VN',
    description: 'Theo dõi danh mục crypto, cảnh báo giá, whale alert realtime',
    url: 'https://cryptoradar.vn',
    siteName: 'CryptoRadar VN',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'CryptoRadar VN', description: 'Công cụ crypto cho nhà đầu tư Việt' },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-dark-900 text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d1526', color: '#e0e6ff', border: '1px solid rgba(100,181,246,0.2)' },
            success: { iconTheme: { primary: '#00e676', secondary: '#0d1526' } },
            error: { iconTheme: { primary: '#ff1744', secondary: '#0d1526' } },
          }}
        />
      </body>
    </html>
  );
}
