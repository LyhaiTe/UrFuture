import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Phlouv — AI Career & Academic Advisor',
  description: 'Cambodian AI Career & Academic Planning Advisor prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
