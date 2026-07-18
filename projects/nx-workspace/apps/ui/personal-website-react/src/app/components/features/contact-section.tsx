import { useState, type FormEvent } from 'react';
import { LINKS } from '../../core/consts/routes.const';
import {
  sendMessage,
  type MessageRequest,
} from '../../core/services/api.service';
import { getRecaptchaToken, useRecaptcha } from '../../core/services/recaptcha';

const APP_NAME_HARRYLIU_DESIGN = 'harryliu-design';
const RECAPTCHA_ACTION = 'contact';
const HEADER_TEXT = 'Message Me';
const SOCIAL_MEDIAS_HEADER = 'Social Medias';
const SUBMITTED_TEXT = "Message received! I'll get back to you soon.";
const SUBMIT_BUTTON_TEXT = 'Submit';
const INVALID_EMAIL_TEXT = 'Please enter a valid email address.';
const UNKNOWN_ERROR_TEXT = 'Something went wrong. Please try again.';

const FIELDS = {
  NAME: {
    ID: 'contact-form-name-input',
    NAME: 'name',
    LABEL: 'Name:',
    AUTOCOMPLETE: 'given-name',
  },
  EMAIL: {
    ID: 'contact-form-email-input',
    NAME: 'email',
    LABEL: 'Email:',
    AUTOCOMPLETE: 'email',
  },
  MESSAGE: {
    ID: 'contact-form-message-input',
    NAME: 'message',
    LABEL: 'Message:',
  },
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASSES =
  'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-800';
const INPUT_BORDER_CLASSES = 'dark:border-gray-700';
const INPUT_ERROR_BORDER_CLASSES = 'border-red-500 dark:border-red-500';

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
  const [emailDirty, setEmailDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const emailInvalid = !EMAIL_PATTERN.test(email);
  const formInvalid = !name.trim() || emailInvalid || !message.trim();
  const showEmailError = emailInvalid && emailDirty;
  const disabled = formInvalid || loading;

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    setLoading(true);
    setSubmitError('');
    try {
      const recaptchaToken = await getRecaptchaToken(RECAPTCHA_ACTION);
      const request: MessageRequest = {
        name,
        email,
        message,
        appName: APP_NAME_HARRYLIU_DESIGN,
        recaptchaToken,
      };
      await sendMessage(request);
      setName('');
      setEmail('');
      setMessage('');
      setEmailDirty(false);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : UNKNOWN_ERROR_TEXT,
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
          {HEADER_TEXT}
        </h2>
        {submitted ? (
          <p className="text-green-600">{SUBMITTED_TEXT}</p>
        ) : (
          <form onSubmit={submitForm}>
            <div className="mb-4">
              <label htmlFor={FIELDS.NAME.ID} className="block">
                {FIELDS.NAME.LABEL}
              </label>
              <input
                type="text"
                id={FIELDS.NAME.ID}
                name={FIELDS.NAME.NAME}
                autoComplete={FIELDS.NAME.AUTOCOMPLETE}
                required
                value={name}
                onChange={event => setName(event.target.value)}
                className={`${INPUT_CLASSES} ${INPUT_BORDER_CLASSES}`}
              />
            </div>
            <div className="mb-4">
              <label htmlFor={FIELDS.EMAIL.ID} className="block">
                {FIELDS.EMAIL.LABEL}
              </label>
              <input
                type="email"
                id={FIELDS.EMAIL.ID}
                name={FIELDS.EMAIL.NAME}
                autoComplete={FIELDS.EMAIL.AUTOCOMPLETE}
                required
                value={email}
                onChange={event => {
                  setEmail(event.target.value);
                  setEmailDirty(true);
                }}
                className={`${INPUT_CLASSES} ${
                  showEmailError
                    ? INPUT_ERROR_BORDER_CLASSES
                    : INPUT_BORDER_CLASSES
                }`}
              />
              {showEmailError && (
                <p className="text-red-500 text-xs mt-1">
                  {INVALID_EMAIL_TEXT}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor={FIELDS.MESSAGE.ID} className="block">
                {FIELDS.MESSAGE.LABEL}
              </label>
              <textarea
                id={FIELDS.MESSAGE.ID}
                name={FIELDS.MESSAGE.NAME}
                required
                value={message}
                onChange={event => setMessage(event.target.value)}
                className={`${INPUT_CLASSES} ${INPUT_BORDER_CLASSES}`}
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
                SUBMIT_BUTTON_TEXT
              )}
            </button>
          </form>
        )}
      </div>
      <hr className="lg:hidden mt-8 mb-8" />
      <div className="w-11/12 lg:w-5/6 mx-auto text-center lg:text-left">
        <div className="mb-4">
          <h1 className="mb-2 text-md font-semibold">{SOCIAL_MEDIAS_HEADER}</h1>
          <ul>
            {CONTACT_LINKS.map(link => (
              <li key={link.text}>
                <a href={link.url.external} target="_blank" rel="noreferrer">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
