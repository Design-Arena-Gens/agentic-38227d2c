import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Nav } from '../components/Nav';

export const metadata = {
  title: 'Solar Ops AI Suite',
  description: 'Tools for SA Solar PV cleaning ops',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <div className="container">
            <Link href="/" className="brand">Solar Ops AI</Link>
            <Nav />
          </div>
        </header>
        <main className="container">{children}</main>
        <footer>
          <div className="container">? {new Date().getFullYear()} Solar Ops AI</div>
        </footer>
      </body>
    </html>
  );
}
