export type EmailSignature = {
  email: string;
  signatureString: string;
};

export type IncomingUser = {
  email: string;
  groups: string[];
  password: string;
  organizationalUnit: string;
};

export type GoogleUserOrganization = {
  email: string;
  title: string;
  department: string;
  costCenter: string;
  description?: string;
};
