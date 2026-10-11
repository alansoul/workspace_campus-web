// src/features/setup-wizard/types/setup.types.ts
export interface SetupFormData {
  accountIntent: 'NEW_DOMAIN' | 'EXISTING_DOMAIN';
  universityName: string;
  shortCode?: string;
  studentBodySize: 'Just you' | '2 - 9' | '10 - 99' | '100 - 299' | '300+';
  region: string;
  adminFirstName: string;
  adminLastName: string;
  currentEmail: string;
  universityDomain: string;
  otpCode: string;
  adminPassword: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;