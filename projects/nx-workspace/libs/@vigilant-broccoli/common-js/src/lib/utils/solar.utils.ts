import { Location } from '../location/location.model';

/**
 * Sunrise/sunset for a location, using the NOAA solar position algorithm.
 * Accurate to roughly a minute, and unlike a weather API it answers for any
 * date rather than only the current day.
 */

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
}

const MS_PER_DAY = 86_400_000;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_DEGREE = 4;
const SOLAR_NOON_MINUTES = 720;
const UNIX_EPOCH_JULIAN_DAY = 2_440_587.5;
const J2000_JULIAN_DAY = 2_451_545;
const DAYS_PER_JULIAN_CENTURY = 36_525;
const DEGREES_PER_CIRCLE = 360;

// Zenith at sunrise/sunset: 90 degrees plus atmospheric refraction and the
// solar disc's apparent radius.
const SUNRISE_ZENITH_DEGREES = 90.833;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

const startOfUtcDay = (date: Date): number =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const julianCentury = (dayStartMs: number): number =>
  (dayStartMs / MS_PER_DAY + UNIX_EPOCH_JULIAN_DAY - J2000_JULIAN_DAY) /
  DAYS_PER_JULIAN_CENTURY;

const geomMeanLongSun = (t: number): number =>
  (280.46646 + t * (36000.76983 + t * 0.0003032)) % DEGREES_PER_CIRCLE;

const geomMeanAnomSun = (t: number): number =>
  357.52911 + t * (35999.05029 - 0.0001537 * t);

const eccentricity = (t: number): number =>
  0.016708634 - t * (0.000042037 + 0.0000001267 * t);

const sunEqOfCentre = (t: number, meanAnom: number): number =>
  Math.sin(toRadians(meanAnom)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
  Math.sin(toRadians(2 * meanAnom)) * (0.019993 - 0.000101 * t) +
  Math.sin(toRadians(3 * meanAnom)) * 0.000289;

const sunApparentLong = (t: number, trueLong: number): number =>
  trueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * t));

const obliquityCorrected = (t: number): number => {
  const meanObliquity =
    23 +
    (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  return meanObliquity + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * t));
};

const equationOfTime = (
  t: number,
  meanLong: number,
  meanAnom: number,
  eccent: number,
  obliquity: number,
): number => {
  const varY = Math.tan(toRadians(obliquity / 2)) ** 2;
  return (
    MINUTES_PER_DEGREE *
    toDegrees(
      varY * Math.sin(2 * toRadians(meanLong)) -
        2 * eccent * Math.sin(toRadians(meanAnom)) +
        4 *
          eccent *
          varY *
          Math.sin(toRadians(meanAnom)) *
          Math.cos(2 * toRadians(meanLong)) -
        0.5 * varY ** 2 * Math.sin(4 * toRadians(meanLong)) -
        1.25 * eccent ** 2 * Math.sin(2 * toRadians(meanAnom)),
    )
  );
};

// Half the length of the day in degrees of rotation; undefined during polar
// day or polar night, when the sun never crosses the horizon.
const sunriseHourAngle = (
  latitude: number,
  declination: number,
): number | null => {
  const cosHourAngle =
    Math.cos(toRadians(SUNRISE_ZENITH_DEGREES)) /
      (Math.cos(toRadians(latitude)) * Math.cos(toRadians(declination))) -
    Math.tan(toRadians(latitude)) * Math.tan(toRadians(declination));

  if (cosHourAngle > 1 || cosHourAngle < -1) {
    return null;
  }

  return toDegrees(Math.acos(cosHourAngle));
};

export const getSunTimes = (
  { latitude, longitude }: Location,
  date: Date = new Date(),
): SunTimes => {
  const dayStartMs = startOfUtcDay(date);
  const t = julianCentury(dayStartMs);

  const meanLong = geomMeanLongSun(t);
  const meanAnom = geomMeanAnomSun(t);
  const eccent = eccentricity(t);
  const apparentLong = sunApparentLong(
    t,
    meanLong + sunEqOfCentre(t, meanAnom),
  );
  const obliquity = obliquityCorrected(t);
  const declination = toDegrees(
    Math.asin(
      Math.sin(toRadians(obliquity)) * Math.sin(toRadians(apparentLong)),
    ),
  );

  const solarNoonMinutes =
    SOLAR_NOON_MINUTES -
    MINUTES_PER_DEGREE * longitude -
    equationOfTime(t, meanLong, meanAnom, eccent, obliquity);

  const hourAngle = sunriseHourAngle(latitude, declination);
  if (hourAngle === null) {
    return { sunrise: null, sunset: null };
  }

  const atMinutes = (minutes: number): Date =>
    new Date(dayStartMs + minutes * MS_PER_MINUTE);

  return {
    sunrise: atMinutes(solarNoonMinutes - MINUTES_PER_DEGREE * hourAngle),
    sunset: atMinutes(solarNoonMinutes + MINUTES_PER_DEGREE * hourAngle),
  };
};
