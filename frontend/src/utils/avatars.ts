// Zhoosh Futuristic & Cinematic Stream Avatars

export interface ZhooshAvatar {
  id: string;
  name: string;
  bgColor: string;
  svgDataUri: string;
}

// Backwards compatibility alias
export type NetflixAvatar = ZhooshAvatar;

const createSvgUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

const NOVA_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg1" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#FF1E56"/>
      <stop offset="55%" stop-color="#7B0F3B"/>
      <stop offset="100%" stop-color="#14030B"/>
    </radialGradient>
    <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#FFA8C5"/>
      <stop offset="100%" stop-color="#FF1E56"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#bg1)"/>
  <circle cx="60" cy="60" r="42" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" fill="none"/>
  <ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(-28 60 60)" stroke="url(#glow1)" stroke-width="3" fill="none" stroke-dasharray="60 12"/>
  <circle cx="60" cy="60" r="22" fill="#FF1E56" opacity="0.45"/>
  <circle cx="60" cy="60" r="13" fill="#FFFFFF" opacity="0.95"/>
  <path d="M 60 26 Q 60 52 34 60 Q 60 68 60 94 Q 60 68 86 60 Q 60 52 60 26 Z" fill="url(#glow1)"/>
  <circle cx="60" cy="60" r="5" fill="#FFFFFF"/>
</svg>`;

const PULSE_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#00C0FF"/>
      <stop offset="50%" stop-color="#0E2F67"/>
      <stop offset="100%" stop-color="#030A18"/>
    </radialGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#00C0FF"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#bg2)"/>
  <polygon points="60,22 94,42 94,78 60,98 26,78 26,42" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
  <polygon points="60,32 84,46 84,74 60,88 36,74 36,46" fill="rgba(0,192,255,0.15)" stroke="url(#grad2)" stroke-width="2.5"/>
  <rect x="47" y="52" width="5" height="16" rx="2.5" fill="#7EE7FF"/>
  <rect x="57.5" y="42" width="5" height="36" rx="2.5" fill="#FFFFFF"/>
  <rect x="68" y="49" width="5" height="22" rx="2.5" fill="#7EE7FF"/>
  <circle cx="60" cy="22" r="3.5" fill="#00C0FF"/>
  <circle cx="94" cy="78" r="3.5" fill="#00C0FF"/>
  <circle cx="26" cy="78" r="3.5" fill="#00C0FF"/>
</svg>`;

const SOLAR_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg3" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#FF9900"/>
      <stop offset="55%" stop-color="#782900"/>
      <stop offset="100%" stop-color="#190600"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8D6"/>
      <stop offset="50%" stop-color="#FFC107"/>
      <stop offset="100%" stop-color="#FF6D00"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#bg3)"/>
  <circle cx="60" cy="60" r="38" stroke="rgba(255,180,0,0.25)" stroke-width="6" fill="none"/>
  <circle cx="60" cy="60" r="27" fill="none" stroke="url(#goldGrad)" stroke-width="3.5" stroke-dasharray="8 5"/>
  <circle cx="60" cy="60" r="19" fill="url(#goldGrad)"/>
  <circle cx="65" cy="55" r="16" fill="#190600"/>
  <circle cx="56" cy="64" r="7" fill="#FFFFFF" opacity="0.95"/>
  <line x1="18" y1="60" x2="102" y2="60" stroke="#FFFFFF" stroke-width="1.5" opacity="0.4"/>
</svg>`;

const PRISM_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg4" cx="50%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="55%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#0E041C"/>
    </radialGradient>
    <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D0FE"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#bg4)"/>
  <polygon points="60,24 90,52 60,96 30,52" fill="rgba(168,85,247,0.18)" stroke="url(#prismGrad)" stroke-width="2.5"/>
  <polygon points="60,24 90,52 60,60" fill="url(#prismGrad)" opacity="0.75"/>
  <polygon points="60,24 30,52 60,60" fill="#E9D5FF" opacity="0.95"/>
  <polygon points="30,52 60,96 60,60" fill="#9333EA" opacity="0.6"/>
  <polygon points="90,52 60,96 60,60" fill="#7E22CE" opacity="0.8"/>
  <circle cx="60" cy="24" r="3" fill="#FFFFFF"/>
  <circle cx="90" cy="52" r="2.5" fill="#FFFFFF"/>
  <circle cx="30" cy="52" r="2.5" fill="#FFFFFF"/>
</svg>`;

const WAVE_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg5" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="55%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#021E17"/>
    </radialGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D1FAE5"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#bg5)"/>
  <circle cx="60" cy="60" r="38" stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="none"/>
  <path d="M 28 64 C 40 40, 52 80, 64 56 C 74 36, 84 68, 94 52" stroke="url(#waveGrad)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M 30 72 C 44 56, 54 84, 68 66 C 76 52, 84 76, 92 64" stroke="#6EE7B7" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.65"/>
  <circle cx="64" cy="56" r="4.5" fill="#FFFFFF"/>
  <circle cx="94" cy="52" r="3" fill="#FFFFFF"/>
  <circle cx="28" cy="64" r="3" fill="#FFFFFF"/>
</svg>`;

const TITANIUM_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg6" cx="50%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#090D16"/>
    </radialGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="url(#bg6)"/>
  <path d="M 36 38 L 84 38 L 78 78 L 60 92 L 42 78 Z" fill="rgba(255,255,255,0.08)" stroke="url(#metalGrad)" stroke-width="3"/>
  <rect x="42" y="52" width="36" height="7" rx="3.5" fill="#38BDF8"/>
  <circle cx="60" cy="55.5" r="5" fill="#FFFFFF"/>
  <circle cx="48" cy="74" r="2" fill="#94A3B8"/>
  <circle cx="72" cy="74" r="2" fill="#94A3B8"/>
</svg>`;

export const ZHOOSH_AVATARS: ZhooshAvatar[] = [
  {
    id: 'avatar-pulse',
    name: 'Cyber Pulse',
    bgColor: '#00C0FF',
    svgDataUri: createSvgUri(PULSE_SVG)
  },
  {
    id: 'avatar-nova',
    name: 'Cosmic Nova',
    bgColor: '#FF1E56',
    svgDataUri: createSvgUri(NOVA_SVG)
  },
  {
    id: 'avatar-prism',
    name: 'Quantum Prism',
    bgColor: '#A855F7',
    svgDataUri: createSvgUri(PRISM_SVG)
  },
  {
    id: 'avatar-solar',
    name: 'Solar Corona',
    bgColor: '#FF9900',
    svgDataUri: createSvgUri(SOLAR_SVG)
  },
  {
    id: 'avatar-wave',
    name: 'Emerald Wave',
    bgColor: '#10B981',
    svgDataUri: createSvgUri(WAVE_SVG)
  },
  {
    id: 'avatar-titanium',
    name: 'Titanium Cyber',
    bgColor: '#38BDF8',
    svgDataUri: createSvgUri(TITANIUM_SVG)
  }
];

// Preserves backwards compatibility for existing imports
export const NETFLIX_AVATARS = ZHOOSH_AVATARS;
export const DEFAULT_AVATAR = ZHOOSH_AVATARS[0].svgDataUri;

export const sanitizeAvatar = (avatarUrl?: string): string => {
  if (!avatarUrl) return DEFAULT_AVATAR;
  // If user has old Netflix avatar saved in localStorage / session, migrate to new Zhoosh avatar
  if (
    avatarUrl.includes('M%2038%2072') ||
    avatarUrl.includes('rx%3D%2224%22') ||
    avatarUrl.includes('rx="24"') ||
    avatarUrl.includes('M 38 72')
  ) {
    return DEFAULT_AVATAR;
  }
  return avatarUrl;
};

