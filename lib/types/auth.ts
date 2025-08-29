export type UserRole = 
  | 'student' 
  | 'admin_news' 
  | 'admin_events' 
  | 'admin_education' 
  | 'admin_eservices' 
  | 'admin_yessenovai' 
  | 'admin_gamification' 
  | 'admin_portfolio' 
  | 'super_admin';

export type Permission = {
  section: string;
  actions: ('read' | 'write' | 'delete' | 'manage')[];
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    { section: 'news', actions: ['read'] },
    { section: 'events', actions: ['read'] },
    { section: 'education', actions: ['read'] },
    { section: 'science', actions: ['read'] },
    { section: 'upbringing', actions: ['read'] },
    { section: 'eservices', actions: ['read'] },
    { section: 'yessenovai', actions: ['read'] },
    { section: 'gamification', actions: ['read'] },
    { section: 'portfolio', actions: ['read'] }
  ],
  admin_news: [
    { section: 'news', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  admin_events: [
    { section: 'events', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'calendar', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  admin_education: [
    { section: 'education', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'science', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'upbringing', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  admin_eservices: [
    { section: 'eservices', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  admin_yessenovai: [
    { section: 'yessenovai', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  admin_gamification: [
    { section: 'gamification', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  admin_portfolio: [
    { section: 'portfolio', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read'] }
  ],
  super_admin: [
    { section: 'news', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'events', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'calendar', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'education', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'science', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'upbringing', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'eservices', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'yessenovai', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'gamification', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'portfolio', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'site_settings', actions: ['read', 'write', 'delete', 'manage'] },
    { section: 'general', actions: ['read', 'write', 'delete', 'manage'] }
  ]
};


