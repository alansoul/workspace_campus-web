export interface AppBrandConfig {
  id: string;
  name: string;
  brandTitle: string;
  tagline: string;
  href: string;
  category: string;
  accentColor: string;
  bgLight: string;
  iconSrc: string;
  features: string[];
}

export const WORKSPACE_BRAND = {
  name: 'Northstar',
  suiteName: 'Northstar Workspace',
  tagline: 'LEARN. CONNECT. WORK. TOGETHER.',
  domain: 'iiitnr.edu.in',
  logoSrc: '/branding/northstar-workspace-icon.svg',
};

export const SUITE_APPS: AppBrandConfig[] = [
  {
    id: 'campus',
    name: 'Campus',
    brandTitle: 'Northstar Campus',
    tagline: 'Education for a brighter future.',
    href: '/academics',
    category: 'Academics & Drive',
    accentColor: '#0066FF',
    bgLight: '#E8F0FE',
    iconSrc: '/icons/northstar-campus-icon.svg',
    features: ['Semester Notes & PYQs', 'Branch Gate Validation', 'Gemini Academic Copilot'],
  },
  {
    id: 'circle',
    name: 'Circle',
    brandTitle: 'Northstar Circle',
    tagline: 'Communities bring people together.',
    href: '/chat',
    category: 'Community Channels',
    accentColor: '#7C4DFF',
    bgLight: '#F3E8FD',
    iconSrc: '/icons/northstar-circle-icon.svg',
    features: ['Real-Time WebSocket Rooms', 'Voice Lounges & Huddles', 'Code Syntax Streaming'],
  },
  {
    id: 'workflow',
    name: 'Workflow',
    brandTitle: 'Northstar Workflow',
    tagline: 'Turn talent into progress.',
    href: '/freelance',
    category: 'Freelance & Escrow',
    accentColor: '#00C853',
    bgLight: '#E6F4EA',
    iconSrc: '/icons/northstar-workflow-icon.svg',
    features: ['Milestone Escrow Vault', 'Peer-to-Peer Proposals', 'Campus Trust Badges'],
  },
];