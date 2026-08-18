import { defaultKeyHasher } from '@better-auth/api-key';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { VB_EXPRESS_SERVICE } from '@vigilant-broccoli/common-js';
import { API_KEY_MODEL, API_KEY_PERMISSION_RESOURCE, auth } from '../auth';

const SEED_ACCOUNT_EMAIL = 'harryliu1995@gmail.com';
const SEED_KEY_NAME = 'legacy-shared';
const KEY_START_LENGTH = 6;

export const syncLegacySharedApiKey = async () => {
  const seedValue = getEnvironmentVariable('VB_EXPRESS_API_KEY');
  if (!seedValue) return;
  const hashedKey = await defaultKeyHasher(seedValue);
  const context = await auth.$context;
  const permissions = {
    [API_KEY_PERMISSION_RESOURCE]: Object.values(VB_EXPRESS_SERVICE),
  };
  // The apiKey model stores permissions as a JSON string, so this writes
  // through the adapter directly rather than auth.api.updateApiKey, which
  // requires a live session and isn't callable from this unauthenticated
  // boot-time context.
  const permissionsUpdate = { permissions: JSON.stringify(permissions) };

  const existingByHash = (await context.adapter.findOne({
    model: API_KEY_MODEL,
    where: [{ field: 'key', value: hashedKey }],
  })) as { id: string } | null;
  if (existingByHash) {
    await context.adapter.update({
      model: API_KEY_MODEL,
      where: [{ field: 'id', value: existingByHash.id }],
      update: permissionsUpdate,
    });
    return;
  }

  const seedKeyUpdate = {
    key: hashedKey,
    start: seedValue.slice(0, KEY_START_LENGTH),
  };
  const existingByName = (await context.adapter.findOne({
    model: API_KEY_MODEL,
    where: [{ field: 'name', value: SEED_KEY_NAME }],
  })) as { id: string } | null;
  if (existingByName) {
    await context.adapter.update({
      model: API_KEY_MODEL,
      where: [{ field: 'id', value: existingByName.id }],
      update: { ...seedKeyUpdate, ...permissionsUpdate },
    });
    return;
  }

  const existingUser =
    await context.internalAdapter.findUserByEmail(SEED_ACCOUNT_EMAIL);
  const user =
    existingUser?.user ??
    (await context.internalAdapter.createUser({
      email: SEED_ACCOUNT_EMAIL,
      name: SEED_ACCOUNT_EMAIL,
      emailVerified: true,
    }));
  const createdKey = await auth.api.createApiKey({
    body: { name: SEED_KEY_NAME, userId: user.id, permissions },
  });
  await context.adapter.update({
    model: API_KEY_MODEL,
    where: [{ field: 'id', value: createdKey.id }],
    update: seedKeyUpdate,
  });
};
