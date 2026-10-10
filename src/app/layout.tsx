import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Northstar Workspace',
  description: 'The All-in-One University Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/google-sans"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#1F1F1F] font-['Google_Sans',sans-serif]">
        {children}
      </body>
    </html>
  );
}