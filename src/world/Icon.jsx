import React from 'react';

export function Icon({ name, size = 22 }) {
  const paths = {
    bag: 'M6 8h12l1 12H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2',
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    task: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
    sound: 'M5 9v6h4l5 4V5L9 9H5Zm12.5 1.2a3 3 0 0 1 0 3.6M19.8 7a7 7 0 0 1 0 10',
    mute: 'M5 9v6h4l5 4V5L9 9H5Zm12 1 4 4m0-4-4 4',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6-1.4 1.4M7.4 16.6 6 18m12 0-1.4-1.4M7.4 7.4 6 6',
    coin: 'M12 3c5 0 9 2 9 4.5S17 12 12 12 3 10 3 7.5 7 3 12 3Zm-9 4.5V12c0 2.5 4 4.5 9 4.5s9-2 9-4.5V7.5M3 12v4.5C3 19 7 21 12 21s9-2 9-4.5V12',
    chevron: 'm9 18 6-6-6-6',
    close: 'M6 6l12 12M18 6 6 18',
    search: 'm21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    gift: 'M20 12v9H4v-9M2 7h20v5H2V7Zm10 14V7m0 0H7.5A2.5 2.5 0 1 1 12 5v2Zm0 0h4.5A2.5 2.5 0 1 0 12 5v2Z',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z',
    bolt: 'm13 2-9 12h7l-1 8 9-12h-7l1-8Z',
    calendar: 'M7 2v3m10-3v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
    recycle: 'm7 19-3-5 3-5m-3 5h8a4 4 0 0 0 3.5-2M17 5l3 5-3 5m3-5h-8a4 4 0 0 0-3.5 2',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.3-2.4 3.5-5.4 3.5-9S14.3 5.4 12 3m0 18c-2.3-2.4-3.5-5.4-3.5-9S9.7 5.4 12 3M3.5 9h17m-17 6h17'
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.gift} />
    </svg>
  );
}
