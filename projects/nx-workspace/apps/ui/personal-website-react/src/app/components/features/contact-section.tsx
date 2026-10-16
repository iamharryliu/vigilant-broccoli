import { Instagram, Linkedin, Mail, type LucideIcon } from 'lucide-react';
import { LINKS, type Link } from '../../core/consts/routes.const';
import { IconActionLink } from '../global/icon-action-link';
import { ContactForm } from './contact-form';

const HEADER_TEXT = 'Get in touch!';
const INTRO_TEXT = 'Feel free to shoot me a message with the contact form.';
const ICON_SIZE = 18;

const SOCIAL_LINKS: { link: Link; icon: LucideIcon }[] = [
  { link: LINKS.LINKEDIN, icon: Linkedin },
  { link: LINKS.PERSONAL_INSTAGRAM, icon: Instagram },
];

export function ContactSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="text-sm">
        <h1 className="text-2xl font-bold mb-4">{HEADER_TEXT}</h1>
        <p className="mb-4">{INTRO_TEXT}</p>
        <a
          href={LINKS.EMAIL.url.external}
          className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Mail size={ICON_SIZE} />
          {LINKS.EMAIL.text}
        </a>
        <div className="flex space-x-4 mt-4">
          {SOCIAL_LINKS.map(({ link, icon }) => (
            <IconActionLink
              key={link.text}
              href={link.url.external ?? '/'}
              icon={icon}
              label={link.text}
              variant="brand"
            />
          ))}
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
