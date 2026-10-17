import { DEMO_USERS, isDemoUserId } from '../consts/demo-users.const';

// Slack cannot resolve a seeded member's id, so it renders as the plain-text name instead of `<@id>`.
export function formatUserMention(userId: string): string {
  if (!isDemoUserId(userId)) return `<@${userId}>`;
  return DEMO_USERS.find(user => user.id === userId)?.realName ?? userId;
}
