import {
  IncomingUser,
  WorkspaceEmailSignatureUpdate,
} from '@vigilant-broccoli/google-workspace';
import { Attachment } from 'nodemailer/lib/mailer';
import { BirthdaySyncUtilities } from './birthday-sync/birthday-sync.models';

interface OnboardUtilities {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchIncomingEmployees: () => Promise<any[]>;
  processIncomingEmployees: (users: IncomingUser[]) => Promise<void>;
}
interface ActiveMaintenanceUtilities {
  fetchEmailSignatures: () => Promise<WorkspaceEmailSignatureUpdate[]>;
  useSignatureCaching: boolean;
  processEmailSignatures: (
    signatures: WorkspaceEmailSignatureUpdate[],
  ) => Promise<void>;
  emailAttachments: (
    attachments: Attachment[],
    receivers: string[],
  ) => Promise<void>;
  recoverUsers: (emails: string[]) => Promise<void>;
  syncData?: () => Promise<void>;
}
export interface OffboardUtilities {
  fetchInactiveEmployees: () => Promise<string[]>;
  processInactiveEmployees: (emails: string[]) => Promise<void>;
}

interface PostRetentionUtilities {
  postRetentionCleanup: () => Promise<void>;
}

export interface EmployeeAbsence {
  id: string;
  employeeEmail: string;
  employeeName: string;
  /** Human-readable leave type, e.g. "Vacation", "Sick Leave". */
  type: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  startDate: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  endDate: string;
}

interface AbsenceUtilities {
  fetchAbsences: () => Promise<EmployeeAbsence[]>;
}

export interface EmployeeHandlerConfig {
  onboardUtilities: OnboardUtilities;
  activeMaintenanceUtilities: ActiveMaintenanceUtilities;
  offboardUtilities: OffboardUtilities;
  postRetentionUtilities: PostRetentionUtilities;
  absenceUtilities: AbsenceUtilities;
  birthdaySyncUtilities?: BirthdaySyncUtilities;
  customFunctions?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: (...args: any[]) => Promise<void>;
  };
}

export interface Office {
  name: string;
  address: string;
  groupEmail: string;
  mapUrl: string;
}

export type CompanyOffice = {
  [K in string]: Office;
};

export interface WorkspaceGroup {
  EMAIL: string;
  ROLES: string[];
}

export interface EmployeeEmailSignature {
  displayName: string;
  title: string;
  office: string;
  image: string;
  phoneNumber: string;
  email: string;
  linkedInURL?: string;
}
