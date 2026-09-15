import {
  DEFAULT_WEATHER_PROVIDER,
  isWeatherProvider,
  Location,
  WEATHER_CONDITIONS,
  WEATHER_PROVIDER,
  WeatherProvider,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { WeatherService } from '@vigilant-broccoli/common-node';

const MALMO: Location = { latitude: 55.605, longitude: 13.0038 };
const MALMO_LABEL = 'Malmö';

const HOURLY_COUNT = 4;
const DAILY_COUNT = 3;

const MS_PER_HOUR = 3600000;
const HOURS_PER_DAY = 24;
const SECONDS_PER_HOUR = 3600;
const MAX_FORECAST_LEAD_DAYS = 16;
const MIN_PLAUSIBLE_TEMP_C = -60;
const MAX_PLAUSIBLE_TEMP_C = 60;
const MALMO_MIN_OFFSET_HOURS = 1;
const MALMO_MAX_OFFSET_HOURS = 2;
const SKIP_EXIT_CODE = 0;

const PASS_MARK = '✓';
const FAIL_MARK = '✗';

let pass = 0;
let fail = 0;

const check = (label: string, result: boolean): void => {
  console.log(`${result ? PASS_MARK : FAIL_MARK} ${label}`);
  if (result) {
    pass += 1;
  } else {
    fail += 1;
  }
};

const isFiniteTemp = (value: number): boolean =>
  Number.isFinite(value) &&
  value > MIN_PLAUSIBLE_TEMP_C &&
  value < MAX_PLAUSIBLE_TEMP_C;

const assertSnapshot = (
  provider: WeatherProvider,
  snapshot: WeatherSnapshot,
): void => {
  const nowMs = Date.now();
  const maxLeadMs = MAX_FORECAST_LEAD_DAYS * HOURS_PER_DAY * MS_PER_HOUR;

  check(
    `reports the requested provider (${provider})`,
    snapshot.provider === provider,
  );

  check(
    'current temperature is plausible Celsius',
    isFiniteTemp(snapshot.current.temperatureC),
  );
  check(
    'current feels-like is plausible Celsius',
    isFiniteTemp(snapshot.current.feelsLikeC),
  );
  check(
    'current condition is a known WEATHER_CONDITION',
    WEATHER_CONDITIONS.includes(snapshot.current.condition),
  );
  check(
    'current isDay is a boolean',
    typeof snapshot.current.isDay === 'boolean',
  );

  const offsetHours = snapshot.timezoneOffsetSeconds / SECONDS_PER_HOUR;
  check(
    `timezone offset matches ${MALMO_LABEL} (CET/CEST)`,
    offsetHours >= MALMO_MIN_OFFSET_HOURS &&
      offsetHours <= MALMO_MAX_OFFSET_HOURS,
  );

  check(
    `hourly returns ${HOURLY_COUNT} entries`,
    snapshot.hourly.length === HOURLY_COUNT,
  );
  check(
    'hourly entries are in the future and chronological',
    snapshot.hourly.every(
      (entry, index) =>
        entry.timestampMs >= nowMs - MS_PER_HOUR &&
        entry.timestampMs < nowMs + maxLeadMs &&
        (index === 0 ||
          entry.timestampMs > snapshot.hourly[index - 1].timestampMs),
    ),
  );
  check(
    'hourly entries carry plausible temps and known conditions',
    snapshot.hourly.every(
      entry =>
        isFiniteTemp(entry.temperatureC) &&
        WEATHER_CONDITIONS.includes(entry.condition),
    ),
  );

  check(
    `daily returns ${DAILY_COUNT} days`,
    snapshot.daily.length === DAILY_COUNT,
  );
  check(
    'daily min <= max with known conditions',
    snapshot.daily.every(
      day =>
        isFiniteTemp(day.tempMinC) &&
        isFiniteTemp(day.tempMaxC) &&
        day.tempMinC <= day.tempMaxC &&
        WEATHER_CONDITIONS.includes(day.condition),
    ),
  );
  check(
    'daily dates are unique and ascending',
    snapshot.daily.every(
      (day, index) => index === 0 || day.date > snapshot.daily[index - 1].date,
    ),
  );
};

const run = async (): Promise<void> => {
  const requested = process.argv[2] ?? process.env.WEATHER_PROVIDER;
  const provider = isWeatherProvider(requested)
    ? requested
    : DEFAULT_WEATHER_PROVIDER;

  console.log('=== weather-service e2e tests ===');
  console.log(`Provider: ${provider}`);
  console.log(
    `Location: ${MALMO_LABEL} (${MALMO.latitude}, ${MALMO.longitude})`,
  );
  console.log('');

  if (
    provider === WEATHER_PROVIDER.OPENWEATHER &&
    !process.env.OPENWEATHER_API_KEY
  ) {
    console.log(
      `${PASS_MARK} openweather snapshot [skipped: OPENWEATHER_API_KEY not set]`,
    );
    process.exit(SKIP_EXIT_CODE);
  }

  const snapshot = await WeatherService.getWeather(MALMO, {
    provider,
    hourlyCount: HOURLY_COUNT,
    dailyCount: DAILY_COUNT,
  });

  assertSnapshot(provider, snapshot);

  console.log('');
  console.log(`=== Results: ${pass} passed, ${fail} failed ===`);

  if (fail > 0) {
    process.exit(1);
  }
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
