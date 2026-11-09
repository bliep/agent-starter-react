import type { MetadataRoute } from 'next';

// Installable web app ("Add to Home Screen"). No service worker: current Chrome and iOS
// install without one, and the tutor needs the network anyway.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tutor de español',
    short_name: 'Español',
    description: 'Voice-first Spanish tutor',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#c62828',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
