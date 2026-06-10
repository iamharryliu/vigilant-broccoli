import { useState, type FormEvent } from 'react';
import { LINKS } from '../../core/consts/routes.const';
import {
  sendMessage,
  type MessageRequest,
} from '../../core/services/api.service';
import { getRecaptchaToken, useRecaptcha } from '../../core/services/recaptcha';

const APP_NAME_HARRYLIU_DESIGN = 'harryliu-design';

const CONTACT_LINKS = [
  LINKS.LINKEDIN,
  LINKS.PERSONAL_INSTAGRAM,
  LINKS.SECONDHAND_STORE_IG,
  LINKS.SKATE_IG,
];

export function ContactSection() {
  useRecaptcha();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken('contact');
      const req: MessageRequest = {
        name,
        email,
        message,
        appName: APP_NAME_HARRYLIU_DESIGN,
        recaptchaToken,
      };
      await sendMessage(req);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      // error already surfaced
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Message Me</h2>
      <form onSubmit={onSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm mb-1" htmlFor="contact-name">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            required
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
      <div className="flex flex-wrap gap-3">
        {CONTACT_LINKS.map(link => (
          <a
            key={link.text}
            href={link.url.external}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {link.text}
          </a>
        ))}
      </div>
    </div>
  );
}
