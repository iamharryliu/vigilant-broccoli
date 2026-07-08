import { Link } from 'react-router-dom';

const CARD_CLASS =
  'block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-500 transition';

interface CardLinkProps {
  href: string;
  title: string;
  description: string;
  route?: boolean;
}

export function CardLink({ href, title, description, route }: CardLinkProps) {
  const content = (
    <>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </>
  );

  if (route) {
    return (
      <Link to={href} className={CARD_CLASS}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={CARD_CLASS}
    >
      {content}
    </a>
  );
}
