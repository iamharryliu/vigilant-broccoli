export type Signature = {
  email: string;
  signatureString: string;
  firstName?: string;
  lastName?: string;
};

export type SignatureTemplate = {
  id: string;
  label: string;
  template: string;
};

export const DEMO_EMAIL = 'demo@example.com';

export const DEMO_SIGNATURE: Signature = {
  email: DEMO_EMAIL,
  firstName: 'Demo',
  lastName: 'User',
  signatureString: '',
};

const PLACEHOLDER_NAME = '{{name}}';
const PLACEHOLDER_EMAIL = '{{email}}';

const sigName = (sig: Signature) =>
  [sig.firstName, sig.lastName].filter(Boolean).join(' ').trim() || sig.email;

export const renderTemplate = (template: string, sig: Signature) =>
  template
    .replaceAll(PLACEHOLDER_NAME, sigName(sig))
    .replaceAll(PLACEHOLDER_EMAIL, sig.email);

const COMPANY_NAME = 'Company Name';
const COMPANY_WEBSITE = 'https://www.company.com';

export const DEFAULT_TEMPLATES: SignatureTemplate[] = [
  {
    id: 'standard',
    label: 'Standard',
    template: `<div style="font-family: Arial, sans-serif; color: #333;">
  <p style="margin: 0; font-size: 15px;"><strong>{{name}}</strong></p>
  <p style="margin: 4px 0; font-size: 13px;">
    <a href="mailto:{{email}}" style="color: #0073e6; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 13px; color: #666;">${COMPANY_NAME} | <a href="${COMPANY_WEBSITE}" style="color: #0073e6; text-decoration: none;">${COMPANY_WEBSITE.replace(/^https?:\/\//, '')}</a></p>
</div>`,
  },
  {
    id: 'neon',
    label: 'Neon',
    template: `<div style="font-family: 'Courier New', monospace; background: #0d0d0d; color: #00ff99; padding: 12px 16px; border-radius: 6px; display: inline-block;">
  <p style="margin: 0; font-size: 15px; color: #00ff99;">▶ <strong>{{name}}</strong></p>
  <p style="margin: 4px 0; font-size: 12px;">
    <a href="mailto:{{email}}" style="color: #00ccff; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 11px; color: #555;">${COMPANY_NAME}</p>
</div>`,
  },
  {
    id: 'retro',
    label: 'Retro',
    template: `<div style="font-family: 'Georgia', serif; border: 2px solid #c8a96e; background: #fdf6e3; padding: 12px 16px; display: inline-block; border-radius: 2px;">
  <p style="margin: 0; font-size: 16px; color: #5c3d1e; letter-spacing: 1px;"><strong>{{name}}</strong></p>
  <p style="margin: 6px 0 2px; font-size: 12px; color: #8a6a3a; text-transform: uppercase; letter-spacing: 2px;">${COMPANY_NAME}</p>
  <p style="margin: 4px 0; font-size: 12px; border-top: 1px solid #c8a96e; padding-top: 6px;">
    <a href="mailto:{{email}}" style="color: #c0392b; text-decoration: none;">{{email}}</a>
  </p>
</div>`,
  },
  {
    id: 'gradient',
    label: 'Gradient',
    template: `<div style="font-family: Arial, sans-serif; padding: 12px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: inline-block; color: white;">
  <p style="margin: 0; font-size: 16px; font-weight: bold; color: white;">{{name}}</p>
  <p style="margin: 4px 0; font-size: 12px; opacity: 0.85;">
    <a href="mailto:{{email}}" style="color: #d4f1ff; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 11px; opacity: 0.7; color: white;">${COMPANY_NAME}</p>
</div>`,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    template: `<div style="font-family: Arial, sans-serif; color: #333; font-size: 13px; border-left: 2px solid #ddd; padding-left: 10px;">
  <strong style="font-size: 14px;">{{name}}</strong><br/>
  <a href="mailto:{{email}}" style="color: #888; text-decoration: none; font-size: 12px;">{{email}}</a>
</div>`,
  },
];

export const UPDATE_ALL_ENDPOINT = '/api/signature/updateAll';
export const TEMPLATES_ENDPOINT = '/api/signature-templates';
