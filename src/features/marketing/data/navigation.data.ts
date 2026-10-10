export interface NavItem {
  title: string;
  desc?: string;
  href: string;
  badge?: string;
}

export interface MegaMenuSection {
  heading: string;
  items: NavItem[];
}

export const SOLUTIONS_MENU = {
  columns: [
    {
      heading: 'FOR INDIVIDUALS',
      items: [
        { title: 'Overview', desc: 'Northstar for individual users', href: '/register' },
      ],
    },
    {
      heading: 'FOR BUSINESS',
      items: [
        { title: 'Overview', desc: 'Northstar Workspace for Teams', href: '/setup' },
        { title: 'Small Business', desc: 'Small business productivity tools', href: '/setup' },
        { title: 'New Business', desc: 'Tools for new student startups', href: '/setup' },
        { title: 'Startups', desc: 'Startup acceleration & workspace credits', href: '/setup' },
      ],
    },
    {
      heading: 'FOR ENTERPRISE',
      items: [
        { title: 'Overview', desc: 'Campus-wide university enterprise', href: '/setup' },
        { title: 'Frontline Workers', desc: 'Faculty & staff mobile management', href: '/setup' },
        { title: 'Work Safer', desc: 'Zero-trust institutional data protection', href: '/setup' },
      ],
    },
    {
      heading: 'MORE',
      items: [
        { title: 'Developers', desc: 'API access & WebSocket hooks', href: '/chat' },
        { title: 'Education', desc: 'Special programs for colleges & universities', href: '/academics' },
        { title: 'Nonprofits', desc: 'Student clubs and university bodies', href: '/chat' },
      ],
    },
  ],
};

export const PRODUCTS_MENU = {
  columns: [
    {
      heading: 'CAMPUS APPS',
      items: [
        { title: 'Northstar Campus', desc: 'Notes, PYQs & Academic Drive', href: '/academics' },
        { title: 'Northstar Circle', desc: 'Real-time WebSocket & voice lounges', href: '/chat' },
        { title: 'Northstar Workflow', desc: 'Freelance marketplace with escrow', href: '/freelance' },
        { title: 'Campus AI', desc: 'Gemini academic copilot & tutor', href: '/academics' },
      ],
    },
    {
      heading: 'MANAGEMENT',
      items: [
        { title: 'Admin Console', desc: 'Apex domain DNS verification & student KYC', href: '/admin' },
        { title: 'Escrow Vault', desc: 'Milestone deposit & fund arbitration', href: '/freelance' },
        { title: 'Course Discussions', desc: 'Subject-wise peer doubt solving', href: '/academics' },
      ],
    },
    {
      heading: 'SECURITY',
      items: [
        { title: 'Domain Isolation', desc: 'Tenant-locked data per university', href: '/setup' },
        { title: 'Single Sign-On', desc: 'Argon2id and Redis OTP validation', href: '/login' },
      ],
    },
  ],
};

export const ENTERPRISE_MENU = {
  featureCards: [
    {
      title: 'Workspace for Enterprise',
      desc: 'Boost productivity through secure, cloud-native tools designed for seamless university collaboration.',
      href: '/setup',
      linkText: 'Enterprise Solutions',
    },
    {
      title: 'AI tools for a better way to work',
      desc: 'Transform work with secure, personalised and campus-ready AI built into your student collaboration tools.',
      href: '/academics',
      linkText: 'AI solutions',
    },
  ],
  columns: [
    {
      heading: 'INDUSTRIES',
      items: [
        { title: 'Higher Education', href: '/setup' },
        { title: 'Engineering & Tech', href: '/setup' },
        { title: 'Research & Labs', href: '/setup' },
      ],
    },
    {
      heading: 'DEPARTMENTS',
      items: [
        { title: 'Computer Science', href: '/academics' },
        { title: 'Placement Cell', href: '/freelance' },
        { title: 'Academic Dean Office', href: '/admin' },
      ],
    },
  ],
};

export const RESOURCES_MENU = {
  columns: [
    {
      heading: 'DISCOVER',
      items: [
        { title: 'AI learnings for work', desc: 'Guides, tutorials and exam prep', href: '/academics' },
        { title: 'Security and trust', desc: 'Keep your campus data safe', href: '/setup' },
        { title: 'Campus stories', desc: 'Student success case studies', href: '/' },
      ],
    },
    {
      heading: 'LEARN',
      items: [
        { title: 'FAQs', desc: 'Answers to commonly asked questions', href: '#faq' },
        { title: 'Training & onboarding', desc: 'Dean and admin deployment guides', href: '/setup' },
      ],
    },
    {
      heading: 'SUPPORT',
      items: [
        { title: 'Support for admins', desc: 'Domain verification assistance', href: '/setup' },
        { title: 'Support for students', desc: 'Account & sign-in help', href: '/login' },
      ],
    },
  ],
};