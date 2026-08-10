import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TailorFit AI — AI Human Body Measurement Platform for Tailors',
  description:
    'Production-grade AI-powered Human Body Measurement Platform estimating real-world tailoring circumferences from photos and live video feed.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
