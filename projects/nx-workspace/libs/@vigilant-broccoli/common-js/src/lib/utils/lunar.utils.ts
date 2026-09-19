/**
 * Moon phase from the sun/moon elongation, using Meeus' low precision lunar
 * series. Accurate to well within a phase name, and unlike a calendar feed it
 * answers for any date without a network call.
 */

export interface MoonPhase {
  name: string;
  icon: string;
  fraction: number;
}

const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JULIAN_DAY = 2_440_587.5;
const J2000_JULIAN_DAY = 2_451_545;
const OBLIQUITY_DEGREES = 23.4397;
const SUN_DISTANCE_KM = 149_598_000;
const PERCENT = 100;

const PHASES = [
  { name: 'New Moon', icon: '🌑' },
  { name: 'Waxing Crescent', icon: '🌒' },
  { name: 'First Quarter', icon: '🌓' },
  { name: 'Waxing Gibbous', icon: '🌔' },
  { name: 'Full Moon', icon: '🌕' },
  { name: 'Waning Gibbous', icon: '🌖' },
  { name: 'Last Quarter', icon: '🌗' },
  { name: 'Waning Crescent', icon: '🌘' },
] as const;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const daysSinceJ2000 = (date: Date): number =>
  date.getTime() / MS_PER_DAY + UNIX_EPOCH_JULIAN_DAY - J2000_JULIAN_DAY;

const obliquity = toRadians(OBLIQUITY_DEGREES);

const rightAscension = (eclipticLong: number, eclipticLat: number): number =>
  Math.atan2(
    Math.sin(eclipticLong) * Math.cos(obliquity) -
      Math.tan(eclipticLat) * Math.sin(obliquity),
    Math.cos(eclipticLong),
  );

const declination = (eclipticLong: number, eclipticLat: number): number =>
  Math.asin(
    Math.sin(eclipticLat) * Math.cos(obliquity) +
      Math.cos(eclipticLat) * Math.sin(obliquity) * Math.sin(eclipticLong),
  );

const sunPosition = (d: number) => {
  const meanAnom = toRadians(357.5291 + 0.98560028 * d);
  const centre = toRadians(
    1.9148 * Math.sin(meanAnom) +
      0.02 * Math.sin(2 * meanAnom) +
      0.0003 * Math.sin(3 * meanAnom),
  );
  const eclipticLong = meanAnom + centre + toRadians(102.9372) + Math.PI;

  return {
    ra: rightAscension(eclipticLong, 0),
    dec: declination(eclipticLong, 0),
  };
};

const moonPosition = (d: number) => {
  const meanLong = toRadians(218.316 + 13.176396 * d);
  const meanAnom = toRadians(134.963 + 13.064993 * d);
  const meanDistance = toRadians(93.272 + 13.22935 * d);

  const eclipticLong = meanLong + toRadians(6.289) * Math.sin(meanAnom);
  const eclipticLat = toRadians(5.128) * Math.sin(meanDistance);

  return {
    ra: rightAscension(eclipticLong, eclipticLat),
    dec: declination(eclipticLong, eclipticLat),
    distanceKm: 385_001 - 20_905 * Math.cos(meanAnom),
  };
};

export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
  const d = daysSinceJ2000(date);
  const sun = sunPosition(d);
  const moon = moonPosition(d);

  const elongation = Math.acos(
    Math.sin(sun.dec) * Math.sin(moon.dec) +
      Math.cos(sun.dec) * Math.cos(moon.dec) * Math.cos(sun.ra - moon.ra),
  );
  const phaseAngle = Math.atan2(
    SUN_DISTANCE_KM * Math.sin(elongation),
    moon.distanceKm - SUN_DISTANCE_KM * Math.cos(elongation),
  );
  // Sign of the limb angle tells waxing from waning, which the illuminated
  // fraction alone cannot.
  const limbAngle = Math.atan2(
    Math.cos(sun.dec) * Math.sin(sun.ra - moon.ra),
    Math.sin(sun.dec) * Math.cos(moon.dec) -
      Math.cos(sun.dec) * Math.sin(moon.dec) * Math.cos(sun.ra - moon.ra),
  );

  const phase = 0.5 + (0.5 * phaseAngle * (limbAngle < 0 ? -1 : 1)) / Math.PI;
  const index = Math.round(phase * PHASES.length) % PHASES.length;

  return {
    ...PHASES[index],
    fraction: (1 + Math.cos(phaseAngle)) / 2,
  };
};

export const formatMoonIllumination = ({ fraction }: MoonPhase): string =>
  `${Math.round(fraction * PERCENT)}%`;
