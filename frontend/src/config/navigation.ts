import { Compass, Info, Image, Shield, Heart, User, LayoutDashboard, Database, Users } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
  icon: any;
  protected?: boolean;
  roles?: string[];
}

export const publicNavLinks: NavLink[] = [
  { label: 'Tour Packages', href: '/treks', icon: Compass },
  { label: 'About', href: '/about', icon: Info },
  { label: 'Gallery', href: '/gallery', icon: Image },
];

export const protectedNavLinks: NavLink[] = [
  { label: 'My Bookings', href: '/dashboard/bookings', icon: Shield },
  { label: 'Health Form', href: '/dashboard/health', icon: Heart },
  { label: 'My Profile', href: '/dashboard/profile', icon: User },
];

export const staffNavLinks: NavLink[] = [
  { 
    label: 'Admin Panel', 
    href: '/adminControl', 
    icon: LayoutDashboard,
    roles: ['ADMIN']
  },
  { 
    label: 'Leader Console', 
    href: '/dashboard', 
    icon: Database,
    roles: ['LEADER']
  },
  {
    label: 'User Directory',
    href: '/dashboard/participants',
    icon: Users,
    roles: ['ADMIN']
  }
];
