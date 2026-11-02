import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/store/cart-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { MobileDock } from '@/components/layout/MobileDock';

export const metadata: Metadata = {
  title: 'LOCKMAN JERSEYS | Football Jerseys in Ghana',
  description: 'Buy authentic football club jerseys, national team kits, and retro classics. Fast delivery across Ghana with instant WhatsApp and Snapchat ordering.',
  keywords: 'football jerseys ghana, black stars jersey, accra football shirts, buy jerseys in ghana, real madrid jersey accra, arsenal jersey accra, whatsapp jersey order ghana',
  icons: {
    icon: '/images/brand/logo.png',
    apple: '/images/brand/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white flex flex-col antialiased selection:bg-white selection:text-black">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileDock />
          <WhatsAppFloatingButton />
        </CartProvider>
      </body>
    </html>
  );
}
