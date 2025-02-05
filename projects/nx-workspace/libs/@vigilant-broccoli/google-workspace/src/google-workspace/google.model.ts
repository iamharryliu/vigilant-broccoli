export interface EmailSignature {
  email: string;
  signatureString: string;
}

export interface IncomingUser {
  email: string;
  groups: string[];
  password: string;
  organizationalUnit: string;
}

export interface GoogleUserOrganization {
  email: string;
  title: string;
  department: string;
  costCenter: string;
  description?: string;
}
