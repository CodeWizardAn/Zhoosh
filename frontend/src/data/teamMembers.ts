// ============================================================================
// Pillai University — A2 Batch | AI Project Competition
// 12-Member Group Project Roster & Legal / Developer Configuration
// ============================================================================
// To customize member names, simply update the `name` field below!
// ============================================================================

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  subRole?: string;
  badge: string;
  avatarGradient: string;
  division: 'legal' | 'developer';
}

export interface AcademicProjectInfo {
  university: string;
  college: string;
  batch: string;
  competition: string;
  groupSize: number;
  academicYear: string;
  projectTitle: string;
  tagline: string;
  guideNote: string;
}

export const ACADEMIC_PROJECT_INFO: AcademicProjectInfo = {
  university: 'Pillai University',
  college: 'Pillai College of Engineering (PCE)',
  batch: 'Batch A2',
  competition: 'AI Project Competition',
  groupSize: 12,
  academicYear: '2025–2026',
  projectTitle: 'Zhoosh: Next-Gen AI Cinema & Music Discovery',
  tagline: 'Dual-Vector Recommendation Engine & Conversational Intelligence',
  guideNote: 'Developed by the 12-Member Engineering Cohort for the AI Project Competition'
};

// ============================================================================
// LEGAL TEAM (12 Members)
// Cool, professional entertainment law, IP, AI ethics, and licensing roles
// ============================================================================
export const LEGAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Legal Member 01',
    role: 'Lead Legal Counsel',
    subRole: 'Intellectual Property & Entertainment Law',
    badge: 'IP Lead',
    avatarGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    division: 'legal'
  },
  {
    id: 2,
    name: 'Legal Member 02',
    role: 'AI Ethics & Governance Officer',
    subRole: 'Algorithmic Fairness & Bias Auditing',
    badge: 'AI Ethics',
    avatarGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    division: 'legal'
  },
  {
    id: 3,
    name: 'Legal Member 03',
    role: 'Media Licensing Counsel',
    subRole: 'Spotify API & TMDB Data Rights',
    badge: 'Licensing',
    avatarGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    division: 'legal'
  },
  {
    id: 4,
    name: 'Legal Member 04',
    role: 'Data Privacy & GDPR Lead',
    subRole: 'User Analytics & DPDP Act Compliance',
    badge: 'Privacy',
    avatarGradient: 'from-violet-600 via-purple-600 to-pink-600',
    division: 'legal'
  },
  {
    id: 5,
    name: 'Legal Member 05',
    role: 'Fair Use & Copyright Specialist',
    subRole: 'Audio Sample & Album Artwork Attribution',
    badge: 'Fair Use',
    avatarGradient: 'from-amber-500 via-orange-600 to-red-600',
    division: 'legal'
  },
  {
    id: 6,
    name: 'Legal Member 06',
    role: 'Streaming Regulatory Advisor',
    subRole: 'Digital Media Distribution Compliance',
    badge: 'Regulatory',
    avatarGradient: 'from-blue-500 via-sky-600 to-cyan-600',
    division: 'legal'
  },
  {
    id: 7,
    name: 'Legal Member 07',
    role: 'Terms of Service Architect',
    subRole: 'Platform Governance & EULA Structuring',
    badge: 'ToS & Policy',
    avatarGradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
    division: 'legal'
  },
  {
    id: 8,
    name: 'Legal Member 08',
    role: 'Cybersecurity & Risk Counsel',
    subRole: 'Token Security & OAuth Vulnerability Review',
    badge: 'Cyber Law',
    avatarGradient: 'from-teal-500 via-emerald-600 to-green-700',
    division: 'legal'
  },
  {
    id: 9,
    name: 'Legal Member 09',
    role: 'Content Moderation Strategist',
    subRole: 'Safe Harbor & Audio Filtering Protocols',
    badge: 'Content Policy',
    avatarGradient: 'from-indigo-500 via-violet-600 to-purple-700',
    division: 'legal'
  },
  {
    id: 10,
    name: 'Legal Member 10',
    role: 'Consumer Protection Lead',
    subRole: 'User Transparency & Dark Pattern Prevention',
    badge: 'Consumer Rights',
    avatarGradient: 'from-rose-500 via-red-600 to-orange-600',
    division: 'legal'
  },
  {
    id: 11,
    name: 'Legal Member 11',
    role: 'Open-Source Compliance Auditor',
    subRole: 'MIT & Apache 2.0 License Verification',
    badge: 'OSS Audit',
    avatarGradient: 'from-sky-500 via-blue-600 to-indigo-700',
    division: 'legal'
  },
  {
    id: 12,
    name: 'Legal Member 12',
    role: 'Legal Operations Lead',
    subRole: 'Pillai University Academic Project Clearance',
    badge: 'Operations',
    avatarGradient: 'from-emerald-600 via-cyan-600 to-blue-700',
    division: 'legal'
  }
];

// ============================================================================
// DEVELOPER TEAM (11 Members)
// Core engineering roster for Pillai University (Batch A2)
// ============================================================================
export const DEVELOPER_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Advaith Nair',
    role: '',
    badge: '',
    avatarGradient: 'from-[#FF1E56] via-[#FF2E93] to-[#A855F7]',
    division: 'developer'
  },
  {
    id: 2,
    name: 'Rituja Patil',
    role: '',
    badge: '',
    avatarGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    division: 'developer'
  },
  {
    id: 3,
    name: 'Arya Parab',
    role: '',
    badge: '',
    avatarGradient: 'from-fuchsia-500 via-pink-600 to-rose-600',
    division: 'developer'
  },
  {
    id: 4,
    name: 'Sanika Palande',
    role: '',
    badge: '',
    avatarGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    division: 'developer'
  },
  {
    id: 5,
    name: 'Shruti Naik',
    role: '',
    badge: '',
    avatarGradient: 'from-amber-500 via-orange-600 to-red-600',
    division: 'developer'
  },
  {
    id: 6,
    name: 'Arathi Nair',
    role: '',
    badge: '',
    avatarGradient: 'from-violet-600 via-purple-600 to-indigo-700',
    division: 'developer'
  },
  {
    id: 7,
    name: 'Anjali Nambiar',
    role: '',
    badge: '',
    avatarGradient: 'from-sky-500 via-cyan-600 to-teal-600',
    division: 'developer'
  },
  {
    id: 8,
    name: 'Ankitha Nair',
    role: '',
    badge: '',
    avatarGradient: 'from-indigo-500 via-blue-600 to-cyan-600',
    division: 'developer'
  },
  {
    id: 9,
    name: 'Sharanya Nair',
    role: '',
    badge: '',
    avatarGradient: 'from-pink-500 via-rose-600 to-red-600',
    division: 'developer'
  },
  {
    id: 10,
    name: 'Jayesh Patil',
    role: '',
    badge: '',
    avatarGradient: 'from-teal-500 via-emerald-600 to-green-700',
    division: 'developer'
  },
  {
    id: 11,
    name: 'Aryan Seethesh',
    role: '',
    badge: '',
    avatarGradient: 'from-blue-500 via-sky-600 to-cyan-500',
    division: 'developer'
  }
];
