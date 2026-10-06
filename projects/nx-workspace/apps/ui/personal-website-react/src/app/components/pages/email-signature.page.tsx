import { useRef, useState } from 'react';
import { GeneralLayout } from '../layouts/general-layout';
import { ENVIRONMENT } from '../../../environments/environment';

const COPY_RESET_MS = 2000;

const ICON_URL = (name: string) =>
  `${ENVIRONMENT.APP_URL}/assets/email-signature/${name}.svg`;

const CALENDAR_EMBED_URL =
  'https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FCopenhagen&showPrint=0&title=Calendar&&src=aGFycnlsaXUxOTk1QGdtYWlsLmNvbQ&src=aGFycnkubGl1QGVsdmExMS5zZQ&color=%237cb342&color=%23e67c73&color=%23b39ddb&src=ZW4uc3dlZGlzaCNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ';

export function EmailSignaturePage() {
  const signatureRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  );

  const handleCopy = async () => {
    const html = signatureRef.current?.innerHTML;
    if (!html) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([signatureRef.current?.innerText ?? ''], {
            type: 'text/plain',
          }),
        }),
      ]);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    setTimeout(() => setCopyState('idle'), COPY_RESET_MS);
  };

  return (
    <GeneralLayout>
      <div className="w-11/12 mx-auto pt-8 pb-12">
        <h1 className="text-2xl font-bold mb-2">Email Signature</h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Click copy, then paste directly into your email client&apos;s
          signature settings. Copying this rendered page (rather than raw HTML
          source) keeps the formatting intact, and the icons below are hosted
          here rather than inlined, so they still show up once an email is
          actually sent.
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="mb-6 bg-gray-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring"
        >
          {copyState === 'copied'
            ? 'Copied!'
            : copyState === 'error'
              ? 'Copy failed — select the signature manually'
              : 'Copy signature'}
        </button>
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 inline-block bg-white">
          <div ref={signatureRef}>
            <table
              cellPadding={0}
              cellSpacing={0}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 14,
                color: '#1f2937',
              }}
            >
              <tbody>
                <tr>
                  <td
                    width={90}
                    height={90}
                    align="center"
                    valign="middle"
                    style={{
                      width: 90,
                      height: 90,
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      fontSize: 46,
                      lineHeight: 1,
                      letterSpacing: -1,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      borderRadius: 12,
                    }}
                  >
                    HL
                  </td>
                  <td width={12}>&nbsp;</td>
                  <td
                    width={3}
                    style={{
                      backgroundColor: '#16a34a',
                      fontSize: 1,
                      lineHeight: '1px',
                      borderRadius: 2,
                    }}
                  >
                    &nbsp;
                  </td>
                  <td width={12}>&nbsp;</td>
                  <td style={{ verticalAlign: 'top' }}>
                    <table cellPadding={0} cellSpacing={0}>
                      <tbody>
                        <tr>
                          <td style={{ paddingBottom: 10 }}>
                            <strong style={{ fontSize: 15, color: '#111827' }}>
                              Harry Liu
                            </strong>
                            <span
                              style={{
                                fontSize: 13,
                                color: '#9ca3af',
                                margin: '0 6px',
                              }}
                            >
                              |
                            </span>
                            <span style={{ fontSize: 13, color: '#4b5563' }}>
                              Passionate Software Developer
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              paddingBottom: 2,
                              fontSize: 13,
                              color: '#4b5563',
                            }}
                          >
                            <img
                              src={ICON_URL('phone')}
                              width={16}
                              height={16}
                              alt=""
                              style={{
                                verticalAlign: 'middle',
                                marginRight: 6,
                              }}
                            />
                            <a
                              href="tel:+46760087296"
                              style={{
                                color: '#4b5563',
                                textDecoration: 'none',
                              }}
                            >
                              +46 76 008 72 96
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              paddingBottom: 10,
                              fontSize: 13,
                              color: '#4b5563',
                            }}
                          >
                            <img
                              src={ICON_URL('mail')}
                              width={16}
                              height={16}
                              alt=""
                              style={{
                                verticalAlign: 'middle',
                                marginRight: 6,
                              }}
                            />
                            <a
                              href="mailto:harryliu1995@gmail.com"
                              style={{
                                color: '#4b5563',
                                textDecoration: 'none',
                              }}
                            >
                              harryliu1995@gmail.com
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table cellPadding={0} cellSpacing={0}>
                              <tbody>
                                <tr>
                                  <td style={{ paddingRight: 10 }}>
                                    <a
                                      href="https://harryliu.dev/"
                                      style={{
                                        color: '#4b5563',
                                        textDecoration: 'none',
                                      }}
                                    >
                                      harryliu.dev
                                    </a>
                                  </td>
                                  <td style={{ paddingRight: 8 }}>
                                    <a href={CALENDAR_EMBED_URL}>
                                      <img
                                        src={ICON_URL('calendar')}
                                        width={16}
                                        height={16}
                                        alt="Schedule"
                                        style={{
                                          verticalAlign: 'middle',
                                          display: 'block',
                                        }}
                                      />
                                    </a>
                                  </td>
                                  <td style={{ paddingRight: 8 }}>
                                    <a href="https://www.linkedin.com/in/iamharryliu/">
                                      <img
                                        src={ICON_URL('linkedin')}
                                        width={16}
                                        height={16}
                                        alt="LinkedIn"
                                        style={{
                                          verticalAlign: 'middle',
                                          display: 'block',
                                        }}
                                      />
                                    </a>
                                  </td>
                                  <td style={{ paddingRight: 8 }}>
                                    <a href="https://github.com/iamharryliu/">
                                      <img
                                        src={ICON_URL('github')}
                                        width={16}
                                        height={16}
                                        alt="GitHub"
                                        style={{
                                          verticalAlign: 'middle',
                                          display: 'block',
                                        }}
                                      />
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
}
