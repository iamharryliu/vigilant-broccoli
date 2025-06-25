// TODO: Split this shit up into its own updates
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

export type WorkspaceEmailSignatureUpdate = {
  email: string;
  signatureString: string;
};

export type WorkspaceManagerUpdate = {
  email: string;
  managerEmail: string;
};

export type WorkspacePhoneNumberUpdate = {
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type WorkspaceCalendarAdd = {
  email: string;
  calendarId: string;
}

export type GoogleBatchCommandPayload = {
  commands: string[];
  assetsDirectory?: string;
};

export type GoogleBatchCommandFactory<T> = {
  batchCommand: (args: T) => Promise<GoogleBatchCommandPayload>;
  args: T;
};
