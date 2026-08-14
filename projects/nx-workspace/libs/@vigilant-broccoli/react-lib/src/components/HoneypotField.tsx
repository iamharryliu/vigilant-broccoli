import type { CSSProperties } from 'react';
import { HONEYPOT_FIELD_NAME } from '@vigilant-broccoli/common-js';

const HONEYPOT_WRAPPER_STYLE: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
};

const HONEYPOT_LABEL_TEXT = 'Leave this field blank';

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const HoneypotField = ({ value, onChange }: HoneypotFieldProps) => (
  <div aria-hidden="true" style={HONEYPOT_WRAPPER_STYLE}>
    <label htmlFor={HONEYPOT_FIELD_NAME}>{HONEYPOT_LABEL_TEXT}</label>
    <input
      type="text"
      id={HONEYPOT_FIELD_NAME}
      name={HONEYPOT_FIELD_NAME}
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={event => onChange(event.target.value)}
    />
  </div>
);
