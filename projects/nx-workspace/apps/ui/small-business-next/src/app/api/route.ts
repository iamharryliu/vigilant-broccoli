import { getSubdirectories } from '../../lib/s3.utils';

export const GET = async () => {
  const dir = await getSubdirectories('cloud8', 'images');
  console.log(dir);
  return new Response('Hello, Next.js!');
};
