import { useState, type FormEvent } from 'react';
import { HONEYPOT_FIELD_NAME } from '@vigilant-broccoli/common-js';
import { APP_NAME } from '@vigilant-broccoli/personal-common-js';
import { HoneypotField } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../../i18n';
import { EXTERNAL_URL } from '../../core/consts/routes.const';
import {
  SEND_MESSAGE_ERROR,
  sendMessage,
} from '../../core/services/api.service';
import { getRecaptchaToken } from '../../core/services/recaptcha';

const FIELD_ID = {
  NAME: 'contact-form-name-input',
  EMAIL: 'contact-form-email-input',
  MESSAGE: 'contact-form-message-input',
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASSES =
  'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300';

const SOCIAL_LINKS = [
  { href: EXTERNAL_URL.CLOUD_8_SKATE_IG, labelKey: 'LINKS.CLOUD_8_SKATE_IG' },
] as const;

export function ContactSection() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [emailDirty, setEmailDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const emailInvalid = !EMAIL_PATTERN.test(email);
  const showEmailError = emailInvalid && emailDirty;
  const formInvalid = !name || emailInvalid || !message;
  const disabled = formInvalid || loading;

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    setLoading(true);
    setSubmitError('');
    try {
      await sendMessage({
        name,
        email,
        message,
        appName: APP_NAME.CLOUD_8_SKATE,
        recaptchaToken: await getRecaptchaToken(),
        [HONEYPOT_FIELD_NAME]: honeypot,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message === SEND_MESSAGE_ERROR.NETWORK
          ? t('CONTACT.NETWORK_ERROR')
          : t('CONTACT.SERVER_ERROR'),
      );
    } finally {
      setLoading(false);
    }
  };

  const buttonStateClasses = [
    disabled ? 'bg-gray-300' : 'bg-black hover:bg-blue-600',
    loading ? 'cursor-not-allowed' : '',
  ].join(' ');

  return (
    <div className="grid lg:grid-cols-2">
      <div className="w-11/12 lg:w-5/6 mx-auto text-sm">
        <h2 className="text-md font-semibold mb-4 text-center lg:text-left">
          {t('CONTACT.HEADER')}
        </h2>
        {submitted ? (
          <p className="text-green-600">{t('CONTACT.SUBMITTED')}</p>
        ) : (
          <form onSubmit={submitForm}>
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            <div className="mb-4">
              <label htmlFor={FIELD_ID.NAME} className="block">
                {t('CONTACT.NAME_LABEL')}
              </label>
              <input
                type="text"
                id={FIELD_ID.NAME}
                name="name"
                autoComplete="given-name"
                required
                value={name}
                onChange={event => setName(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
            <div className="mb-4">
              <label htmlFor={FIELD_ID.EMAIL} className="block">
                {t('CONTACT.EMAIL_LABEL')}
              </label>
              <input
                type="email"
                id={FIELD_ID.EMAIL}
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={event => {
                  setEmail(event.target.value);
                  setEmailDirty(true);
                }}
                className={`${INPUT_CLASSES} ${
                  showEmailError ? 'border-red-500' : ''
                }`}
              />
              {showEmailError && (
                <p className="text-red-500 text-xs mt-1">
                  {t('CONTACT.INVALID_EMAIL')}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor={FIELD_ID.MESSAGE} className="block">
                {t('CONTACT.MESSAGE_LABEL')}
              </label>
              <textarea
                id={FIELD_ID.MESSAGE}
                name="message"
                required
                value={message}
                onChange={event => setMessage(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
            {submitError && (
              <p role="alert" className="text-red-500 text-xs mb-4">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={disabled}
              className={`text-white font-semibold py-2 rounded-lg focus:outline-none focus:ring w-full lg:w-auto lg:min-w-28 flex items-center justify-center ${buttonStateClasses}`}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.292A7.952 7.952 0 014 12H2c0 3.866 2.239 7.155 5.292 8.708l1.416-1.416z"
                  />
                </svg>
              ) : (
                t('CONTACT.SUBMIT')
              )}
            </button>
          </form>
        )}
      </div>
      <hr className="lg:hidden mt-8 mb-8" />
      <div className="w-11/12 lg:w-5/6 mx-auto text-center lg:text-left">
        <div className="mb-4">
          <h2 className="mb-2 text-md font-semibold">
            {t('CONTACT.SOCIAL_MEDIAS')}
          </h2>
          <ul>
            {SOCIAL_LINKS.map(link => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
