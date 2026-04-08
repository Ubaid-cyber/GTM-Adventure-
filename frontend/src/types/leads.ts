/**
 * Local LeadStatus enum to decouple UI from Prisma client generation issues.
 * Matches the Prisma schema definition.
 */
export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: LeadStatus;
  trekId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  trek?: {
    title: string;
  };
}
