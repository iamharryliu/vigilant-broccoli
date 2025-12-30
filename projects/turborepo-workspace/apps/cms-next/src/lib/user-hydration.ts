import { query, queryOne, execute } from "./db";
import { UserType } from "./constants";

interface User {
  id: string;
  username: string;
  email: string | null;
  is_verified: boolean;
  user_type: string;
  created_at: Date;
  updated_at: Date;
}

interface Application {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Hydrate user data from database using email from auth session
 * This is called after BetterAuth authentication to get full user details
 */
export async function hydrateUserByEmail(email: string): Promise<User | null> {
  if (!email) return null;

  // Find user in database by email
  let user = await queryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  // If user doesn't exist, create them automatically (auto-registration)
  if (!user) {
    const username = email.split("@")[0];
    user = await queryOne<User>(
      `INSERT INTO users (email, username, is_verified, user_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email, username, true, UserType.USER]
    );
  }

  return user;
}

/**
 * Get applications accessible to a user
 */
export async function getUserApplications(userId: string): Promise<Application[]> {
  // First get the user to check if they're a system admin
  const user = await queryOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  if (!user) return [];

  // System admins get all applications
  if (user.user_type === UserType.SYSTEM_ADMIN) {
    return await query<Application>('SELECT * FROM applications ORDER BY name');
  }

  // Get applications through user's groups
  const apps = await query<Application>(
    `SELECT DISTINCT a.*
     FROM applications a
     INNER JOIN group_applications ga ON ga.application_id = a.id
     INNER JOIN group_users gu ON gu.group_id = ga.group_id
     WHERE gu.user_id = $1
     ORDER BY a.name`,
    [userId]
  );

  return apps;
}

/**
 * Check if user has privilege to access an application
 */
export async function hasPrivilege(userId: string, appName: string): Promise<boolean> {
  // First get the user to check if they're a system admin
  const user = await queryOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  if (!user) return false;

  // System admins have access to everything
  if (user.user_type === UserType.SYSTEM_ADMIN) return true;

  // Check if user is in a group that has access to this application
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1
       FROM applications a
       INNER JOIN group_applications ga ON ga.application_id = a.id
       INNER JOIN group_users gu ON gu.group_id = ga.group_id
       WHERE gu.user_id = $1 AND a.name = $2
     ) as exists`,
    [userId, appName]
  );

  return result?.exists || false;
}
