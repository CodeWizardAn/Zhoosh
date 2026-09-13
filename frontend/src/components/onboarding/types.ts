export type OnboardingStep = 
  | 'landing' 
  | 'plans' 
  | 'account' 
  | 'preferences' 
  | 'reveal';

export interface SubscriptionPlan {
  id: 'basic' | 'standard' | 'premium';
  name: string;
  tagline: string;
  priceMonthly: number;
  quality: string;
  resolution: string;
  simultaneousStreams: number;
  features: string[];
  recommended?: boolean;
  accentColor: string;
  badge?: string;
}

export interface PreferenceItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'movie' | 'music';
  category: string;
  section: 'language' | 'genre';
  iconName: string;
  gradient: string;
  accentColor: string;
  tags: string[];
}

export interface OnboardingUserData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  selectedPlan: SubscriptionPlan | null;
  selectedPreferences: PreferenceItem[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Zhoosh Core',
    tagline: 'Essential cinematic & acoustic experience',
    priceMonthly: 8.99,
    quality: 'Good HD',
    resolution: '720p',
    simultaneousStreams: 1,
    accentColor: '#7C3AED',
    features: [
      'Access to standard cinema catalog',
      'Lossless music streaming at 160 kbps',
      'Watch on phone, tablet, and laptop',
      'Ad-free audio track skips'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Zhoosh',
    tagline: 'High-definition dual cinema & spatial audio',
    priceMonthly: 14.99,
    quality: 'Full HD 1080p',
    resolution: '1080p',
    simultaneousStreams: 2,
    recommended: true,
    badge: 'MOST POPULAR',
    accentColor: '#FF1E56',
    features: [
      'Unlimited 1080p Full HD movies & shows',
      'Lossless 320 kbps High-Res audio',
      'Stream on 2 screens concurrently',
      'Download up to 100 offline titles',
      'Unified cross-domain AI recommendations'
    ]
  },
  {
    id: 'premium',
    name: 'Zhoosh VIP Ultra',
    tagline: 'Ultimate 4K HDR + Dolby Atmos acoustic sanctuary',
    priceMonthly: 21.99,
    quality: 'Ultra HD 4K + HDR',
    resolution: '4K HDR',
    simultaneousStreams: 4,
    badge: 'BEST EXPERIENCE',
    accentColor: '#A855F7',
    features: [
      'Ultra HD 4K + Dolby Vision HDR cinema',
      'Studio Master FLAC + Dolby Atmos 3D audio',
      'Stream on 4 concurrent devices',
      'Offline downloads on 6 active devices',
      'Priority AI taste curator & concierge',
      'Early access to remastered classics'
    ]
  }
];

export const PREFERENCE_ITEMS: PreferenceItem[] = [
  // ==========================================
  // 1. MOVIES - LANGUAGES FIRST
  // ==========================================
  {
    id: 'm-lang-en',
    title: 'English',
    subtitle: 'Hollywood & Global Originals',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#FF1E56]/90 to-[#990022]',
    accentColor: '#FF1E56',
    tags: ['Hollywood', 'Global', 'English Cinema']
  },
  {
    id: 'm-lang-hi',
    title: 'Hindi',
    subtitle: 'Bollywood & Indian Blockbusters',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#FF2E93]/90 to-[#B8005A]',
    accentColor: '#FF1E56',
    tags: ['Bollywood', 'Hindi Cinema', 'Desi Hits']
  },
  {
    id: 'm-lang-es',
    title: 'Spanish',
    subtitle: 'Latin Cinema & Thrilling Drama',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#E50914]/90 to-[#7A0000]',
    accentColor: '#FF1E56',
    tags: ['Español', 'Money Heist', 'Latin']
  },
  {
    id: 'm-lang-ko',
    title: 'Korean',
    subtitle: 'K-Dramas & Gripping Cinema',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#D83A1E]/90 to-[#6E1C12]',
    accentColor: '#FF1E56',
    tags: ['K-Drama', 'Squid Game', 'Korean Thrillers']
  },
  {
    id: 'm-lang-ja',
    title: 'Japanese',
    subtitle: 'Anime & Iconic Japanese Film',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#FF477E]/90 to-[#990033]',
    accentColor: '#FF1E56',
    tags: ['Anime', 'Ghibli', 'Japanese']
  },
  {
    id: 'm-lang-fr',
    title: 'French',
    subtitle: 'European Romance & Auteur Cinema',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#C4402A]/90 to-[#5C1005]',
    accentColor: '#FF1E56',
    tags: ['French', 'European', 'Art House']
  },
  {
    id: 'm-lang-ta',
    title: 'Tamil',
    subtitle: 'Kollywood & Intense Action',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#B22222]/90 to-[#4A0000]',
    accentColor: '#FF1E56',
    tags: ['Kollywood', 'South Cinema', 'Tamil Hits']
  },
  {
    id: 'm-lang-te',
    title: 'Telugu',
    subtitle: 'Tollywood & Epic Spectacles',
    type: 'movie',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#E04B30]/90 to-[#8A1A07]',
    accentColor: '#FF1E56',
    tags: ['Tollywood', 'RRR', 'South Epics']
  },

  // ==========================================
  // 1. MOVIES - BASIC GENRES (User Specified)
  // Romance, Action, Thriller, Comedy, Sitcom, Anime, Drama, Sci-Fi, Horror
  // ==========================================
  {
    id: 'm-genre-romance',
    title: 'Romance',
    subtitle: 'Heartfelt love stories & chemistry',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Heart',
    gradient: 'from-[#FF1E56]/90 to-[#8A0028]',
    accentColor: '#FF1E56',
    tags: ['Love', 'Romantic', 'Passion']
  },
  {
    id: 'm-genre-action',
    title: 'Action',
    subtitle: 'High-octane blockbusters & stunt battles',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Zap',
    gradient: 'from-[#E50914]/90 to-[#6B0008]',
    accentColor: '#FF1E56',
    tags: ['Explosive', 'Stunts', 'Combat']
  },
  {
    id: 'm-genre-thriller',
    title: 'Thriller',
    subtitle: 'Edge-of-your-seat suspense & twists',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Eye',
    gradient: 'from-[#990000]/90 to-[#3B0000]',
    accentColor: '#FF1E56',
    tags: ['Mystery', 'Suspense', 'Crime']
  },
  {
    id: 'm-genre-comedy',
    title: 'Comedy',
    subtitle: 'Laugh-out-loud humor & witty fun',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Smile',
    gradient: 'from-[#FF477E]/90 to-[#990033]',
    accentColor: '#FF1E56',
    tags: ['Humor', 'Laughs', 'Feel-Good']
  },
  {
    id: 'm-genre-sitcom',
    title: 'Sitcom',
    subtitle: 'Comfort comedies & episodic favorites',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Tv',
    gradient: 'from-[#D83A1E]/90 to-[#5C1005]',
    accentColor: '#FF1E56',
    tags: ['Friends', 'Office', 'Binge']
  },
  {
    id: 'm-genre-anime',
    title: 'Anime',
    subtitle: 'Epic Japanese animation & fantasies',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Flame',
    gradient: 'from-[#E04B30]/90 to-[#8A1A07]',
    accentColor: '#FF1E56',
    tags: ['Animation', 'Manga', 'Shonen']
  },
  {
    id: 'm-genre-drama',
    title: 'Drama',
    subtitle: 'Emotional journeys & profound stories',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Film',
    gradient: 'from-[#B33924]/90 to-[#581105]',
    accentColor: '#FF1E56',
    tags: ['Human Story', 'Deep', 'Cinema']
  },
  {
    id: 'm-genre-scifi',
    title: 'Sci-Fi',
    subtitle: 'Cosmic frontiers & futuristic marvels',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Sparkles',
    gradient: 'from-[#FF1E56]/90 to-[#500018]',
    accentColor: '#FF1E56',
    tags: ['Cyberpunk', 'Space', 'Future']
  },
  {
    id: 'm-genre-horror',
    title: 'Horror',
    subtitle: 'Supernatural tension, chills & dread',
    type: 'movie',
    category: 'Genre',
    section: 'genre',
    iconName: 'Moon',
    gradient: 'from-[#6E0000]/90 to-[#200000]',
    accentColor: '#FF1E56',
    tags: ['Spooky', 'Chills', 'Supernatural']
  },

  // ==========================================
  // 2. MUSIC - LANGUAGES FIRST
  // ==========================================
  {
    id: 's-lang-en',
    title: 'English',
    subtitle: 'Global Pop, Rock & Billboard Hits',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#A855F7]/90 to-[#4C1D95]',
    accentColor: '#A855F7',
    tags: ['Global', 'Billboard', 'English Hits']
  },
  {
    id: 's-lang-hi',
    title: 'Hindi',
    subtitle: 'Bollywood, Desi Indie & Soulful Melodies',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#9333EA]/90 to-[#3B0764]',
    accentColor: '#A855F7',
    tags: ['Bollywood', 'Arijit', 'Hindi Tracks']
  },
  {
    id: 's-lang-es',
    title: 'Spanish',
    subtitle: 'Latin Pop, Reggaeton & Sizzling Beats',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#C084FC]/90 to-[#581C87]',
    accentColor: '#A855F7',
    tags: ['Reggaeton', 'Latin Beats', 'Spanish']
  },
  {
    id: 's-lang-ko',
    title: 'Korean',
    subtitle: 'K-Pop Bangers & Korean R&B',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#8B5CF6]/90 to-[#2E1065]',
    accentColor: '#A855F7',
    tags: ['K-Pop', 'BTS', 'Blackpink']
  },
  {
    id: 's-lang-pa',
    title: 'Punjabi',
    subtitle: 'Bhangra, Urban Rap & High Voltage',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#7C3AED]/90 to-[#2E1065]',
    accentColor: '#A855F7',
    tags: ['Punjabi', 'Diljit', 'Sidhu', 'Bhangra']
  },
  {
    id: 's-lang-fr',
    title: 'French',
    subtitle: 'French Pop, Chanson & Nu-Disco',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#6D28D9]/90 to-[#1F0738]',
    accentColor: '#A855F7',
    tags: ['French Pop', 'Daft Punk', 'Chanson']
  },
  {
    id: 's-lang-ta',
    title: 'Tamil',
    subtitle: 'Kollywood Melodies & AR Rahman Magic',
    type: 'music',
    category: 'Language',
    section: 'language',
    iconName: 'Globe',
    gradient: 'from-[#A855F7]/90 to-[#3B0764]',
    accentColor: '#A855F7',
    tags: ['AR Rahman', 'Anirudh', 'Tamil Melodies']
  },

  // ==========================================
  // 2. MUSIC - BASIC GENRES (User Specified)
  // Romantic, Pop, Rock, Hip-Hop, Lo-Fi, Electronic, Classical
  // ==========================================
  {
    id: 's-genre-romantic',
    title: 'Romantic',
    subtitle: 'Soulful love songs, acoustics & feelings',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Heart',
    gradient: 'from-[#FF2E93]/90 to-[#7E0041]',
    accentColor: '#A855F7',
    tags: ['Love Songs', 'Soul', 'Slow Dance']
  },
  {
    id: 's-genre-pop',
    title: 'Pop',
    subtitle: 'Catchy radio anthems & chart-toppers',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Sparkles',
    gradient: 'from-[#A855F7]/90 to-[#581C87]',
    accentColor: '#A855F7',
    tags: ['Top 40', 'Catchy', 'Danceable']
  },
  {
    id: 's-genre-rock',
    title: 'Rock',
    subtitle: 'Electric guitars, rock bands & energy',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Volume2',
    gradient: 'from-[#8B5CF6]/90 to-[#3B0764]',
    accentColor: '#A855F7',
    tags: ['Guitar', 'Alternative', 'Classic Rock']
  },
  {
    id: 's-genre-hiphop',
    title: 'Hip-Hop',
    subtitle: '808 bass, urban rap & lyrical flow',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Mic',
    gradient: 'from-[#7C3AED]/90 to-[#2E1065]',
    accentColor: '#A855F7',
    tags: ['Rap', 'Trap', 'Beats']
  },
  {
    id: 's-genre-lofi',
    title: 'Lo-Fi',
    subtitle: 'Mellow chillhop, vinyl crackle & study vibes',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Coffee',
    gradient: 'from-[#C084FC]/90 to-[#4C1D95]',
    accentColor: '#A855F7',
    tags: ['Chill', 'Relax', 'Study']
  },
  {
    id: 's-genre-electronic',
    title: 'Electronic',
    subtitle: 'EDM drops, house synths & club beats',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Headphones',
    gradient: 'from-[#9333EA]/90 to-[#2E1065]',
    accentColor: '#A855F7',
    tags: ['EDM', 'House', 'Synth']
  },
  {
    id: 's-genre-classical',
    title: 'Classical',
    subtitle: 'Symphonic strings, piano & acoustics',
    type: 'music',
    category: 'Genre',
    section: 'genre',
    iconName: 'Music',
    gradient: 'from-[#6D28D9]/90 to-[#1F0738]',
    accentColor: '#A855F7',
    tags: ['Piano', 'Orchestra', 'Masterpieces']
  }
];

export const TRANSITION_BEZIER = [0.22, 1, 0.36, 1] as const;
export const SPRING_CURVE = { type: 'spring', stiffness: 420, damping: 28 } as const;
