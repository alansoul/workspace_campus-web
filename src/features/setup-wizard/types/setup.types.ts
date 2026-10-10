// src/features/setup-wizard/types/setup.types.ts

export interface SetupFormData {
  // Step 1: Intent
  accountIntent: 'NEW_DOMAIN' | 'EXISTING_DOMAIN';
  
  // Step 2: Org Details (Screenshots 3 & 4)
  universityName: string;
  studentBodySize: 'Just you' | '2 - 9' | '10 - 99' | '100 - 299' | '300+';
  region: string;
  
  // Step 3: Admin Contact (Screenshot 5)
  adminFirstName: string;
  adminLastName: string;
  currentEmail: string;

  // Step 4: Apex Domain (Screenshot 6)
  universityDomain: string; // e.g., "stanford.edu" or "iitb.ac.in"

  // Step 5: Verification & Password
  otpCode: string;
  adminPassword: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;