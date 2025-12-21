'use client';

import { Card, Flex, Box, Text, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';

interface WeatherData {
  city: string;
  timezone: number;
  now: {
    temp: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    icon: string;
  }>;
}

const CITIES = [
  { name: 'MALMÖ', lat: 55.605, lon: 13.0038 },
  { name: 'COPENHAGEN', lat: 55.6761, lon: 12.5683 },
  { name: 'TORONTO', lat: 43.6532, lon: -79.3832 },
];

const getCurrentTime = (timezoneOffset: number): string => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + timezoneOffset * 1000);

  const hours = cityTime.getHours().toString().padStart(2, '0');
  const minutes = cityTime.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

const getWeatherIcon = (iconCode: string): string => {
  const iconMap: Record<string, string> = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '🌤️',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  return iconMap[iconCode] || '☁️';
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
};

export const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outfitRecommendation, setOutfitRecommendation] = useState<
    Record<string, string>
  >({});
  const [loadingOutfit, setLoadingOutfit] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPromises = CITIES.map(async city => {
          const response = await fetch(
            `/api/weather?lat=${city.lat}&lon=${city.lon}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }

          const { current, forecast } = await response.json();

          const dailyForecasts: Record<
            string,
            { temps: number[]; icons: string[] }
          > = {};

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          forecast.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyForecasts[date]) {
              dailyForecasts[date] = { temps: [], icons: [] };
            }
            dailyForecasts[date].temps.push(item.main.temp);
            dailyForecasts[date].icons.push(item.weather[0].icon);
          });

          const forecastDays = Object.entries(dailyForecasts)
            .slice(0, 2)
            .map(([date, data]) => ({
              day: getDayName(date),
              tempHigh: Math.round(Math.max(...data.temps)),
              tempLow: Math.round(Math.min(...data.temps)),
              icon: data.icons[Math.floor(data.icons.length / 2)],
            }));

          return {
            city: city.name,
            timezone: current.timezone,
            now: {
              temp: Math.round(current.main.temp),
              icon: current.weather[0].icon,
            },
            forecast: forecastDays,
          };
        });

        const data = await Promise.all(weatherPromises);
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data');
        setLoading(false);
        console.error('Weather fetch error:', err);
      }
    };

    fetchWeather();
  }, []);

  const getOutfitRecommendation = async (city: {
    name: string;
    lat: number;
    lon: number;
  }) => {
    setLoadingOutfit(prev => ({ ...prev, [city.name]: true }));
    setOutfitRecommendation(prev => ({ ...prev, [city.name]: '' }));

    try {
      const response = await fetch(
        `/api/outfit-recommendation?lat=${city.lat}&lon=${city.lon}`,
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get outfit recommendation');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setOutfitRecommendation(prev => ({
          ...prev,
          [city.name]: (prev[city.name] || '') + chunk,
        }));
      }
    } catch (err) {
      console.error('Error fetching outfit recommendation:', err);
      setOutfitRecommendation(prev => ({
        ...prev,
        [city.name]: 'Failed to get recommendation',
      }));
    } finally {
      setLoadingOutfit(prev => ({ ...prev, [city.name]: false }));
    }
  };

  if (loading) {
    return <CardSkeleton title="Weather" rows={6} />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">
            Weather
          </Text>
          <Text color="red">{error}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Flex direction="column" gap="4" p="4">
        <Text size="5" weight="bold">
          Weather
        </Text>

        {weatherData.map((cityWeather, cityIndex) => {
          const city = CITIES[cityIndex];
          return (
            <Box key={cityWeather.city}>
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div className="flex flex-col justify-start pt-6">
                  <Text size="1" weight="bold" className="text-gray-700">
                    {cityWeather.city}
                  </Text>
                  <Text size="1" className="text-gray-500">
                    {getCurrentTime(cityWeather.timezone)}
                  </Text>
                </div>

                <div className="flex flex-col items-center">
                  <Text size="1" className="mb-2 text-gray-600">
                    Now
                  </Text>
                  <div className="text-3xl mb-2">
                    {getWeatherIcon(cityWeather.now.icon)}
                  </div>
                  <Text size="3" weight="bold">
                    {cityWeather.now.temp}°C
                  </Text>
                </div>

                {cityWeather.forecast.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <Text size="1" className="mb-2 text-gray-600">
                      {day.day}
                    </Text>
                    <div className="text-3xl mb-2">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <Text size="3" weight="bold">
                      {day.tempHigh}°C{' '}
                      <Text size="2" color="gray">
                        | {day.tempLow}°C
                      </Text>
                    </Text>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <Button
                  size="1"
                  variant="soft"
                  onClick={() => getOutfitRecommendation(city)}
                  disabled={loadingOutfit[city.name]}
                  className="mb-2"
                >
                  {loadingOutfit[city.name]
                    ? 'Getting recommendation...'
                    : 'Get Outfit Recommendation'}
                </Button>

                {outfitRecommendation[city.name] && (
                  <Box className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <Text size="2" className="whitespace-pre-wrap">
                      {outfitRecommendation[city.name]}
                    </Text>
                  </Box>
                )}
              </div>
            </Box>
          );
        })}
      </Flex>
    </Card>
  );
};
