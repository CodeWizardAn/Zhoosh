// Authentic Netflix-style vector avatars

export interface NetflixAvatar {
  id: string;
  name: string;
  bgColor: string;
  svgDataUri: string;
}

const createSvgDataUri = (bgColor: string, eyeType: 'dots' | 'wink' | 'glasses' = 'dots') => {
  const eyes =
    eyeType === 'glasses'
      ? `<rect x="26" y="42" width="28" height="16" rx="4" fill="#FFFFFF"/>
         <rect x="66" y="42" width="28" height="16" rx="4" fill="#FFFFFF"/>
         <line x1="54" y1="50" x2="66" y2="50" stroke="#FFFFFF" stroke-width="4"/>`
      : eyeType === 'wink'
      ? `<circle cx="40" cy="48" r="8" fill="#FFFFFF"/>
         <path d="M 68 48 Q 78 40 88 48" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" fill="none"/>`
      : `<circle cx="42" cy="48" r="8" fill="#FFFFFF"/>
         <circle cx="78" cy="48" r="8" fill="#FFFFFF"/>`;

  const svg = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="24" fill="${bgColor}"/>
    ${eyes}
    <path d="M 38 72 Q 60 96 82 72" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const NETFLIX_AVATARS: NetflixAvatar[] = [
  {
    id: 'avatar-red',
    name: 'Classic Red Smile',
    bgColor: '#E50914',
    svgDataUri: createSvgDataUri('#E50914', 'dots')
  },
  {
    id: 'avatar-blue',
    name: 'Electric Blue Smile',
    bgColor: '#0071EB',
    svgDataUri: createSvgDataUri('#0071EB', 'dots')
  },
  {
    id: 'avatar-yellow',
    name: 'Neon Gold Wink',
    bgColor: '#F59E0B',
    svgDataUri: createSvgDataUri('#F59E0B', 'wink')
  },
  {
    id: 'avatar-purple',
    name: 'Cyber Violet Shades',
    bgColor: '#9D4EDD',
    svgDataUri: createSvgDataUri('#9D4EDD', 'glasses')
  },
  {
    id: 'avatar-green',
    name: 'Emerald Mint Smile',
    bgColor: '#10B981',
    svgDataUri: createSvgDataUri('#10B981', 'dots')
  },
  {
    id: 'avatar-dark',
    name: 'Obsidian Stealth Shades',
    bgColor: '#1E1E28',
    svgDataUri: createSvgDataUri('#1E1E28', 'glasses')
  }
];

export const DEFAULT_AVATAR = NETFLIX_AVATARS[0].svgDataUri;
