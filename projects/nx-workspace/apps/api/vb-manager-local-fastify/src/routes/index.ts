import { FastifyPluginAsync } from 'fastify';
import apiKeysRoutes from './api-keys';
import authRoutes from './auth';
import awsRoutes from './aws';
import bucketRoutes from './bucket';
import calendarRoutes from './calendar';
import chatRoutes from './chat';
import diskSpaceRoutes from './disk-space';
import djRoutes from './dj';
import dockerRoutes from './docker';
import eventCalendarsRoutes from './event-calendars';
import flyioRoutes from './flyio';
import gcloudRoutes from './gcloud';
import generateSecretRoutes from './generate-secret';
import githubRoutes from './github';
import kanbanRoutes from './kanban';
import languageLearningRoutes from './language-learning';
import llmTestRoutes from './llm-test';
import localIpRoutes from './local-ip';
import localMachineRoutes from './local-machine';
import localServicesRoutes from './local-services';
import networkMonitorRoutes from './network-monitor';
import notepadRoutes from './notepad';
import outfitRecommendationRoutes from './outfit-recommendation';
import pm2Routes from './pm2';
import publicIpRoutes from './public-ip';
import qrCodeRoutes from './qr-code';
import recipeRoutes from './recipe';
import resumeRoutes from './resume';
import sendEmailMessageRoutes from './send-email-message';
import sendTextMessageRoutes from './send-text-message';
import shellRoutes from './shell';
import speechToTextRoutes from './speech-to-text';
import speedTestRoutes from './speed-test';
import sshKeyRoutes from './ssh-key';
import stripeRoutes from './stripe';
import tailscaleRoutes from './tailscale';
import tasksRoutes from './tasks';
import terraformRoutes from './terraform';
import textToSpeechRoutes from './text-to-speech';
import todoRoutes from './todo';
import vercelRoutes from './vercel';
import voiceListRoutes from './voice-list';
import weatherRoutes from './weather';
import wireguardRoutes from './wireguard';
import wranglerRoutes from './wrangler';

const ROUTE_PLUGINS: [FastifyPluginAsync, string][] = [
  [apiKeysRoutes, '/api-keys'],
  [authRoutes, '/auth'],
  [awsRoutes, '/aws'],
  [bucketRoutes, '/bucket'],
  [calendarRoutes, '/calendar'],
  [chatRoutes, '/chat'],
  [diskSpaceRoutes, '/disk-space'],
  [djRoutes, '/dj'],
  [dockerRoutes, '/docker'],
  [eventCalendarsRoutes, '/event-calendars'],
  [flyioRoutes, '/flyio'],
  [gcloudRoutes, '/gcloud'],
  [generateSecretRoutes, '/generate-secret'],
  [githubRoutes, '/github'],
  [kanbanRoutes, '/kanban'],
  [languageLearningRoutes, '/language-learning'],
  [llmTestRoutes, '/llm-test'],
  [localIpRoutes, '/local-ip'],
  [localMachineRoutes, '/local-machine'],
  [localServicesRoutes, '/local-services'],
  [networkMonitorRoutes, '/network-monitor'],
  [notepadRoutes, '/notepad'],
  [outfitRecommendationRoutes, '/outfit-recommendation'],
  [pm2Routes, '/pm2'],
  [publicIpRoutes, '/public-ip'],
  [qrCodeRoutes, '/qr-code'],
  [recipeRoutes, '/recipe'],
  [resumeRoutes, '/resume'],
  [sendEmailMessageRoutes, '/send-email-message'],
  [sendTextMessageRoutes, '/send-text-message'],
  [shellRoutes, '/shell'],
  [speechToTextRoutes, '/speech-to-text'],
  [speedTestRoutes, '/speed-test'],
  [sshKeyRoutes, '/ssh-key'],
  [stripeRoutes, '/stripe'],
  [tailscaleRoutes, '/tailscale'],
  [tasksRoutes, '/tasks'],
  [terraformRoutes, '/terraform'],
  [textToSpeechRoutes, '/text-to-speech'],
  [todoRoutes, '/todo'],
  [vercelRoutes, '/vercel'],
  [voiceListRoutes, '/voice-list'],
  [weatherRoutes, '/weather'],
  [wireguardRoutes, '/wireguard'],
  [wranglerRoutes, '/wrangler'],
];

const apiRoutes: FastifyPluginAsync = async app => {
  for (const [plugin, prefix] of ROUTE_PLUGINS) {
    await app.register(plugin, { prefix });
  }
};

export default apiRoutes;
