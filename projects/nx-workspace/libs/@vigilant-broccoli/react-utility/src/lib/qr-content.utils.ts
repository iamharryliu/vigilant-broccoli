import { toOpenableUrl } from './qr.utils';

type QrContentKind =
  | 'url'
  | 'wifi'
  | 'email'
  | 'phone'
  | 'sms'
  | 'location'
  | 'contact'
  | 'text';

type QrField = {
  label: string;
  value: string;
  copyable?: boolean;
  secret?: boolean;
};

export type QrAction = { label: string; href: string; external: boolean };

export type QrContent = {
  kind: QrContentKind;
  fields: QrField[];
  action: QrAction | null;
};

export const QR_CONTENT_KIND_LABEL: Record<QrContentKind, string> = {
  url: 'Link',
  wifi: 'Wi-Fi network',
  email: 'Email',
  phone: 'Phone number',
  sms: 'Text message',
  location: 'Location',
  contact: 'Contact',
  text: 'Plain text',
};

const FIELD = {
  NETWORK: 'Network',
  PASSWORD: 'Password',
  SECURITY: 'Security',
  HIDDEN: 'Hidden network',
  TO: 'To',
  SUBJECT: 'Subject',
  BODY: 'Message',
  NUMBER: 'Number',
  COORDINATES: 'Coordinates',
  NAME: 'Name',
  PHONE: 'Phone',
  EMAIL: 'Email',
  ORGANIZATION: 'Organization',
  WEBSITE: 'Website',
  ADDRESS: 'Address',
};

const ACTION = {
  OPEN_LINK: 'Open link',
  SEND_EMAIL: 'Send email',
  CALL: 'Call',
  SEND_TEXT: 'Send text',
  OPEN_MAPS: 'Open in Maps',
};

const PREFIX = {
  WIFI: 'wifi:',
  MAILTO: 'mailto:',
  MATMSG: 'matmsg:',
  TEL: 'tel:',
  SMS: 'sms:',
  SMSTO: 'smsto:',
  GEO: 'geo:',
  MECARD: 'mecard:',
  VCARD: 'begin:vcard',
};

const KEY = {
  WIFI_SECURITY: 'T',
  WIFI_SSID: 'S',
  WIFI_PASSWORD: 'P',
  WIFI_HIDDEN: 'H',
  EMAIL_TO: 'TO',
  EMAIL_SUBJECT: 'SUB',
  EMAIL_BODY: 'BODY',
  NAME: 'N',
  FORMATTED_NAME: 'FN',
  PHONE: 'TEL',
  EMAIL: 'EMAIL',
  ORGANIZATION: 'ORG',
  WEBSITE: 'URL',
  ADDRESS: 'ADR',
};

const WIFI_NO_PASSWORD = 'nopass';
const TRUE_VALUE = 'true';
const YES = 'Yes';
const ESCAPE_CHAR = '\\';
const FIELD_SEPARATOR = ';';
const KEY_SEPARATOR = ':';
const QUERY_SEPARATOR = '?';
const ENCODED_SPACE = '%20';
const ENCODED_AT = /%40/g;
const AT_SIGN = '@';
const FORM_ENCODED_SPACE = /\+/g;
const SMS_BODY_PARAM = 'body';
const MAILTO_SUBJECT_PARAM = 'subject';
const MAILTO_BODY_PARAM = 'body';
const PHONE_DISALLOWED_CHARS = /[^\d+*#]/g;
const COORDINATE_PATTERN = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const GOOGLE_MAPS_SEARCH_URL =
  'https://www.google.com/maps/search/?api=1&query=';
const VCARD_LINE_BREAK = /\r?\n/;
const VCARD_FOLDED_LINE = /\r?\n[ \t]/g;
const VCARD_PARAM_SEPARATOR = ';';
const VCARD_NAME_SEPARATOR = ';';
const MECARD_NAME_SEPARATOR = ',';
const NAME_JOINER = ' ';
const ADDRESS_JOINER = ', ';

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const hasPrefix = (value: string, prefix: string) =>
  value.toLowerCase().startsWith(prefix);

const stripPrefix = (value: string, prefix: string) =>
  value.slice(prefix.length);

const splitUnescaped = (value: string, separator: string): string[] => {
  const parts: string[] = [];
  let current = '';
  let escaped = false;
  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === ESCAPE_CHAR) {
      escaped = true;
    } else if (char === separator) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
};

const parseKeyedFields = (body: string): Record<string, string[]> =>
  splitUnescaped(body, FIELD_SEPARATOR).reduce<Record<string, string[]>>(
    (fields, part) => {
      const separatorIndex = part.indexOf(KEY_SEPARATOR);
      if (separatorIndex <= 0) return fields;
      const key = part.slice(0, separatorIndex).toUpperCase();
      const value = part.slice(separatorIndex + 1);
      if (!value) return fields;
      return { ...fields, [key]: [...(fields[key] ?? []), value] };
    },
    {},
  );

const firstValue = (fields: Record<string, string[]>, key: string) =>
  fields[key]?.[0];

const allValues = (fields: Record<string, string[]>, key: string) =>
  fields[key] ?? [];

const compactFields = (
  fields: (QrField | null | undefined | false)[],
): QrField[] => fields.filter((field): field is QrField => Boolean(field));

const field = (
  label: string,
  value: string | undefined,
  copyable = false,
): QrField | null => (value ? { label, value, copyable } : null);

const secretField = (label: string, value: string | undefined) =>
  value ? { label, value, copyable: true, secret: true } : null;

const toDialable = (number: string) =>
  number.replace(PHONE_DISALLOWED_CHARS, '');

const toSmsHref = (dialable: string, message?: string) =>
  `${PREFIX.SMS}${dialable}${
    message
      ? `${QUERY_SEPARATOR}${SMS_BODY_PARAM}=${encodeURIComponent(message)}`
      : ''
  }`;

const toMailtoHref = (to: string, subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set(MAILTO_SUBJECT_PARAM, subject);
  if (body) params.set(MAILTO_BODY_PARAM, body);
  const query = params.toString().replace(FORM_ENCODED_SPACE, ENCODED_SPACE);
  return `${PREFIX.MAILTO}${encodeURIComponent(to).replace(ENCODED_AT, AT_SIGN)}${
    query ? `${QUERY_SEPARATOR}${query}` : ''
  }`;
};

const parseWifi = (value: string): QrContent => {
  const fields = parseKeyedFields(stripPrefix(value, PREFIX.WIFI));
  const security = firstValue(fields, KEY.WIFI_SECURITY);
  const hasPassword = security?.toLowerCase() !== WIFI_NO_PASSWORD;
  return {
    kind: 'wifi',
    fields: compactFields([
      field(FIELD.NETWORK, firstValue(fields, KEY.WIFI_SSID), true),
      hasPassword &&
        secretField(FIELD.PASSWORD, firstValue(fields, KEY.WIFI_PASSWORD)),
      hasPassword && field(FIELD.SECURITY, security),
      firstValue(fields, KEY.WIFI_HIDDEN)?.toLowerCase() === TRUE_VALUE &&
        field(FIELD.HIDDEN, YES),
    ]),
    action: null,
  };
};

const toEmailContent = (
  to: string,
  subject?: string,
  body?: string,
): QrContent => ({
  kind: 'email',
  fields: compactFields([
    field(FIELD.TO, to, true),
    field(FIELD.SUBJECT, subject),
    field(FIELD.BODY, body, true),
  ]),
  action: to
    ? {
        label: ACTION.SEND_EMAIL,
        href: toMailtoHref(to, subject, body),
        external: false,
      }
    : null,
});

const parseMailto = (value: string): QrContent => {
  const [address, query = ''] = stripPrefix(value, PREFIX.MAILTO).split(
    QUERY_SEPARATOR,
  );
  const params = new URLSearchParams(query);
  return toEmailContent(
    safeDecode(address),
    params.get(MAILTO_SUBJECT_PARAM) ?? undefined,
    params.get(MAILTO_BODY_PARAM) ?? undefined,
  );
};

const parseMatmsg = (value: string): QrContent => {
  const fields = parseKeyedFields(stripPrefix(value, PREFIX.MATMSG));
  return toEmailContent(
    firstValue(fields, KEY.EMAIL_TO) ?? '',
    firstValue(fields, KEY.EMAIL_SUBJECT),
    firstValue(fields, KEY.EMAIL_BODY),
  );
};

const parsePhone = (value: string): QrContent => {
  const number = safeDecode(stripPrefix(value, PREFIX.TEL));
  const dialable = toDialable(number);
  return {
    kind: 'phone',
    fields: compactFields([field(FIELD.NUMBER, number, true)]),
    action: dialable
      ? {
          label: ACTION.CALL,
          href: `${PREFIX.TEL}${dialable}`,
          external: false,
        }
      : null,
  };
};

const toSmsContent = (number: string, message?: string): QrContent => {
  const dialable = toDialable(number);
  return {
    kind: 'sms',
    fields: compactFields([
      field(FIELD.NUMBER, number, true),
      field(FIELD.BODY, message, true),
    ]),
    action: dialable
      ? {
          label: ACTION.SEND_TEXT,
          href: toSmsHref(dialable, message),
          external: false,
        }
      : null,
  };
};

const parseSms = (value: string): QrContent => {
  const [number, query = ''] = stripPrefix(value, PREFIX.SMS).split(
    QUERY_SEPARATOR,
  );
  const message = new URLSearchParams(query).get(SMS_BODY_PARAM) ?? undefined;
  return toSmsContent(safeDecode(number), message);
};

const parseSmsto = (value: string): QrContent => {
  const body = stripPrefix(value, PREFIX.SMSTO);
  const separatorIndex = body.indexOf(KEY_SEPARATOR);
  return separatorIndex < 0
    ? toSmsContent(body)
    : toSmsContent(
        body.slice(0, separatorIndex),
        body.slice(separatorIndex + 1),
      );
};

const parseGeo = (value: string): QrContent | null => {
  const match = stripPrefix(value, PREFIX.GEO).match(COORDINATE_PATTERN);
  if (!match) return null;
  const coordinates = `${match[1]},${match[2]}`;
  return {
    kind: 'location',
    fields: [{ label: FIELD.COORDINATES, value: coordinates, copyable: true }],
    action: {
      label: ACTION.OPEN_MAPS,
      href: `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(coordinates)}`,
      external: true,
    },
  };
};

const toContactContent = (contact: {
  name?: string;
  phones: string[];
  emails: string[];
  organization?: string;
  website?: string;
  address?: string;
}): QrContent => ({
  kind: 'contact',
  fields: compactFields([
    field(FIELD.NAME, contact.name, true),
    ...contact.phones.map(phone => field(FIELD.PHONE, phone, true)),
    ...contact.emails.map(email => field(FIELD.EMAIL, email, true)),
    field(FIELD.ORGANIZATION, contact.organization),
    field(FIELD.WEBSITE, contact.website, true),
    field(FIELD.ADDRESS, contact.address, true),
  ]),
  action: null,
});

const joinParts = (parts: string[], joiner: string) =>
  parts
    .map(part => part.trim())
    .filter(Boolean)
    .join(joiner) || undefined;

const joinSplitValue = (
  value: string | undefined,
  separator: string,
  joiner: string,
) => (value ? joinParts(value.split(separator), joiner) : undefined);

const toDisplayName = (nameValue: string | undefined, separator: string) => {
  const [lastName = '', firstName = ''] = (nameValue ?? '').split(separator);
  return joinParts([firstName, lastName], NAME_JOINER);
};

const parseMecard = (value: string): QrContent => {
  const fields = parseKeyedFields(stripPrefix(value, PREFIX.MECARD));
  return toContactContent({
    name: toDisplayName(firstValue(fields, KEY.NAME), MECARD_NAME_SEPARATOR),
    phones: allValues(fields, KEY.PHONE),
    emails: allValues(fields, KEY.EMAIL),
    organization: firstValue(fields, KEY.ORGANIZATION),
    website: firstValue(fields, KEY.WEBSITE),
    address: firstValue(fields, KEY.ADDRESS),
  });
};

const parseVcardLines = (value: string): Record<string, string[]> =>
  value
    .replace(VCARD_FOLDED_LINE, '')
    .split(VCARD_LINE_BREAK)
    .reduce<Record<string, string[]>>((fields, line) => {
      const separatorIndex = line.indexOf(KEY_SEPARATOR);
      if (separatorIndex <= 0) return fields;
      const key = line
        .slice(0, separatorIndex)
        .split(VCARD_PARAM_SEPARATOR)[0]
        .toUpperCase();
      const lineValue = line.slice(separatorIndex + 1).trim();
      if (!lineValue) return fields;
      return { ...fields, [key]: [...(fields[key] ?? []), lineValue] };
    }, {});

const parseVcard = (value: string): QrContent => {
  const fields = parseVcardLines(value);
  return toContactContent({
    name:
      firstValue(fields, KEY.FORMATTED_NAME) ??
      toDisplayName(firstValue(fields, KEY.NAME), VCARD_NAME_SEPARATOR),
    phones: allValues(fields, KEY.PHONE),
    emails: allValues(fields, KEY.EMAIL),
    organization: joinSplitValue(
      firstValue(fields, KEY.ORGANIZATION),
      VCARD_NAME_SEPARATOR,
      NAME_JOINER,
    ),
    website: firstValue(fields, KEY.WEBSITE),
    address: joinSplitValue(
      firstValue(fields, KEY.ADDRESS),
      VCARD_NAME_SEPARATOR,
      ADDRESS_JOINER,
    ),
  });
};

const toUrlContent = (value: string): QrContent | null => {
  const href = toOpenableUrl(value);
  return href
    ? {
        kind: 'url',
        fields: [],
        action: { label: ACTION.OPEN_LINK, href, external: true },
      }
    : null;
};

const TEXT_CONTENT: QrContent = { kind: 'text', fields: [], action: null };

const PREFIX_PARSERS: [string, (value: string) => QrContent | null][] = [
  [PREFIX.WIFI, parseWifi],
  [PREFIX.MAILTO, parseMailto],
  [PREFIX.MATMSG, parseMatmsg],
  [PREFIX.TEL, parsePhone],
  [PREFIX.SMSTO, parseSmsto],
  [PREFIX.SMS, parseSms],
  [PREFIX.GEO, parseGeo],
  [PREFIX.MECARD, parseMecard],
  [PREFIX.VCARD, parseVcard],
];

export const parseQrContent = (value: string): QrContent => {
  const trimmed = value.trim();
  const parser = PREFIX_PARSERS.find(([prefix]) => hasPrefix(trimmed, prefix));
  const parsed = parser ? parser[1](trimmed) : toUrlContent(trimmed);
  return parsed ?? TEXT_CONTENT;
};
