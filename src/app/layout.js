'use client';
import { useEffect } from 'react';
import { setupCacheInvalidation } from '@/utils/cacheManager';

export default function RootLayout({ children }) {
  useEffect(() => {
    setupCacheInvalidation();
  }, []);

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Nogura Reservasi',
  description: 'Nogura Reservasi System',
}

// Add cache control
export const headers = {
  'Cache-Control': 'no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}