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

export type GoogleManagerUpdate = {
  email: string;
  managerEmail: string;
};

export type GooglePhoneNumberUpdate = {
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type GoogleBatchOperation = {
  commands: string[];
  assetsDirectory?: string;
};

export type GoogleBatchOperationArgs<T> = {
  batchCommand: (args: T) => Promise<GoogleBatchOperation>;
  args: T;
};
