import {
  IncomingUser,
  EmailSignature,
} from '@vigilant-broccoli/google-workspace';
import { Attachment } from 'nodemailer/lib/mailer';

interface OnboardUtilities {
  getIncomingEmployees: () => Promise<IncomingUser[]>;
  onboardUsers: (users: IncomingUser[]) => Promise<void>;
}
interface ActiveMaintenanceUtilities {
  getEmployeeSignatures: () => Promise<EmailSignature[]>;
  useSignatureCaching: boolean;
  updateEmailSignatures: (signatures: EmailSignature[]) => Promise<void>;
  emailZippedSignatures: (attachments: Attachment[]) => Promise<void>;
  recoverUsers: (emails: string[]) => Promise<void>;
  syncData?: () => Promise<void>;
}
interface OffboardUtilities {
  getOffboardEmails: () => Promise<string[]>;
  offboardEmployees: (emails: string[]) => Promise<void>;
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
