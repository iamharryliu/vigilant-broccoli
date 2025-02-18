import {
  IncomingUser,
  EmailSignature,
} from '@vigilant-broccoli/google-workspace';
import { Attachment } from 'nodemailer/lib/mailer';

interface OnboardUtilities {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchIncomingEmployees: () => Promise<any[]>;
  processIncomingEmployees: (users: IncomingUser[]) => Promise<void>;
}
interface ActiveMaintenanceUtilities {
  fetchEmailSignatures: () => Promise<EmailSignature[]>;
  useSignatureCaching: boolean;
  processEmailSignatures: (signatures: EmailSignature[]) => Promise<void>;
  emailZippedSignatures: (attachments: Attachment[]) => Promise<void>;
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

export interface EmployeeHandlerConfig {
  onboardUtilities: OnboardUtilities;
  activeMaintenanceUtilities: ActiveMaintenanceUtilities;
  offboardUtilities: OffboardUtilities;
  postRetentionUtilities: PostRetentionUtilities;
  customFunctions?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: (...args: any[]) => Promise<void>;
  };
}
