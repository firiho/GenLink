import { User as SupabaseUser } from '@supabase/supabase-js'

export interface Organization {
  name: string;
  logo?: string;
}

export interface User extends SupabaseUser {
  id: string;
  email: string;
  fullName?: string;
  userType: 'partner' | 'participant' | 'admin';
  status?: 'pending' | 'approved';
  organization?: Organization;
  position?: string;
  createdAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  organization: string;
  participants: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  submissions: number;
  progress: number;
  daysLeft: number;
  prize: string;
  deadline: string;
  categories: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
} 

export interface Partner {
  id: string;
  name: string;
  email: string;
  status: string;
  type: string;
  appliedDate: string;
  location: string;
  description: string;
}