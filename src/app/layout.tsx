import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/store/cart-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';

export const metadata: Metadata = {
  title: 'LOCKMAN JERSEYS | Football Jerseys in Ghana',
  description: 'Buy authentic football club jerseys, national team kits, and retro classics. Fast delivery across Ghana with Mobile Money or WhatsApp ordering.',
  keywords: 'football jerseys ghana, black stars jersey, accra football shirts, buy jerseys in ghana, real madrid jersey accra, arsenal jersey accra, momo payment jerseys',
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
      <body className="min-h-screen bg-[#070707] text-white flex flex-col antialiased selection:bg-white selection:text-black">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloatingButton />
        </CartProvider>
      </body>
    </html>
  );
}
