// `check` reads the ElevenLabs subscription and writes the quota fields to
// GITHUB_OUTPUT; `email` sends the quota alert through the email service
// tunnel opened by the workflow.
import { appendFileSync } from 'node:fs';

const SUBSCRIPTION_URL = 'https://api.elevenlabs.io/v1/user/subscription';
const EMAIL_URL =
  process.env.EMAIL_URL ?? 'http://127.0.0.1:3000/api/send-email';
const EMAIL_TO = process.env.EMAIL_TO ?? 'harryliu1995@gmail.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Quota Monitor <ci-deploy@harryliu.dev>';

const LEVEL = { none: 'none', warning: 'warning', exhausted: 'exhausted' };

const toUtcDate = unix => new Date(unix * 1000).toISOString().slice(0, 10);

const setOutputs = outputs =>
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(''),
  );

const check = async () => {
  const threshold = Number(process.env.THRESHOLD_PERCENT);
  const response = await fetch(SUBSCRIPTION_URL, {
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
  });
  if (!response.ok) {
    throw new Error(
      `ElevenLabs subscription request failed: ${response.status}`,
    );
  }
  const subscription = await response.json();
  const used = subscription.character_count;
  const limit = subscription.character_limit;
  const percent = (used / limit) * 100;
  const level =
    used >= limit
      ? LEVEL.exhausted
      : percent >= threshold
        ? LEVEL.warning
        : LEVEL.none;
  setOutputs({
    level,
    tier: subscription.tier,
    used,
    limit,
    percent: percent.toFixed(1),
    remaining: Math.max(limit - used, 0),
    refresh_period: subscription.character_refresh_period,
    reset_unix: subscription.next_character_count_reset_unix,
    reset_date: toUtcDate(subscription.next_character_count_reset_unix),
  });
};

const email = async () => {
  const {
    LEVEL: level,
    TIER,
    USED,
    LIMIT,
    PERCENT,
    REMAINING,
    REFRESH_PERIOD,
    RESET_DATE,
    RUN_URL,
    SHARED_APP_TOKEN,
  } = process.env;
  const heading =
    level === LEVEL.exhausted
      ? 'ElevenLabs quota exhausted'
      : level === LEVEL.warning
        ? 'ElevenLabs quota nearly used'
        : 'ElevenLabs quota report';
  const rows = [
    ['Tier', TIER],
    ['Characters used', `${USED} / ${LIMIT} (${PERCENT}%)`],
    ['Remaining characters', REMAINING],
    ['Refresh period', REFRESH_PERIOD],
    ['Resets (UTC)', RESET_DATE],
  ];
  const html =
    `<div style="font-family:sans-serif;font-size:14px;padding:16px;"><p><strong>${heading}</strong></p><table>` +
    rows
      .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
      .join('') +
    `</table><p><a href="${RUN_URL}">View run</a></p></div>`;
  const text = [
    heading,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    RUN_URL,
  ].join('\n');
  const response = await fetch(EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SHARED_APP_TOKEN,
    },
    body: JSON.stringify({
      to: EMAIL_TO,
      from: EMAIL_FROM,
      subject: `${heading}: ${USED}/${LIMIT} characters`,
      html,
      text,
    }),
  });
  console.log(`elevenlabs-quota email: ${response.status}`);
  if (!response.ok) process.exit(1);
};

const COMMANDS = { check, email };
await COMMANDS[process.argv[2]]();
