export type ContractStatus = 'ESCROW_LOCKED' | 'IN_REVIEW' | 'COMPLETED' | 'DRAFT';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isCompleted: boolean;
  deliverableNote?: string;
}

export interface FreelanceContract {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  description: string;
  totalAmount: number;
  status: ContractStatus;
  category: 'Fullstack' | 'Design' | 'Smart Contract' | 'Mobile App' | 'Bounty';
  createdAt: string;
  milestones: Milestone[];
}