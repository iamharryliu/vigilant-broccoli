import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_SIZE = 22;

const BASE_CLASSES = 'transition-all duration-200 hover:scale-110';

const VARIANT_CLASSES = {
  default: 'hover:text-blue-600 dark:hover:text-blue-400',
  brand: 'hover:text-blue-700 dark:hover:text-blue-500',
} as const;

type Variant = keyof typeof VARIANT_CLASSES;

type BaseProps = {
  icon: LucideIcon;
  label: string;
  variant?: Variant;
};

type Props =
  | (BaseProps & { href: string; to?: never; onClick?: never })
  | (BaseProps & { to: string; href?: never; onClick?: never })
  | (BaseProps & { onClick: () => void; href?: never; to?: never });

export function IconActionLink(props: Props) {
  const { icon: Icon, label, variant = 'default' } = props;
  const className = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`;

  if ('href' in props && props.href) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className={className}
      >
        <Icon size={ICON_SIZE} />
      </a>
    );
  }

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} aria-label={label} className={className}>
        <Icon size={ICON_SIZE} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={label}
      className={className}
    >
      <Icon size={ICON_SIZE} />
    </button>
  );
}
