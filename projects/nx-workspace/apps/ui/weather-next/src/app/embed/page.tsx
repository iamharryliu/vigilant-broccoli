import type { Metadata } from 'next';
import { WeatherEmbed } from '../components/WeatherEmbed';

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <WeatherEmbed />;
}
