import { LocalWeather, Location } from '@vigilant-broccoli/common-js';
import { QUERY_PARAM, WEATHER_API_PATH } from './weather.consts';

export const fetchWeather = ({ latitude, longitude }: Location) =>
  fetch(
    `${WEATHER_API_PATH}?${new URLSearchParams({
      [QUERY_PARAM.LAT]: String(latitude),
      [QUERY_PARAM.LON]: String(longitude),
    })}`,
  ).then(response =>
    response.ok ? (response.json() as Promise<LocalWeather>) : null,
  );
