import { useState } from 'react';
import { Switch } from '@vigilant-broccoli/react-lib';
import {
  DashboardInfoCardUtilityContent,
  DashboardInfoCardWeather,
} from '@vigilant-broccoli/react-utility';
import { WEATHER_CONDITION } from '@vigilant-broccoli/common-js';

const LOADING_LABEL = 'Loading state';

const DEMO_LOCATION = { latitude: 55.605, longitude: 13.0038 };
const DEMO_TIMEZONE_OFFSET_SECONDS = 7200;

const DEMO_WEATHER: DashboardInfoCardWeather = {
  city: 'Malmö',
  temp: 18,
  condition: WEATHER_CONDITION.PARTLY_CLOUDY,
  isDay: true,
};

export const DashboardInfoCardDemo = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Switch checked={loading} onCheckedChange={setLoading} />
        {LOADING_LABEL}
      </label>

      <DashboardInfoCardUtilityContent
        location={DEMO_LOCATION}
        timezoneOffsetSeconds={DEMO_TIMEZONE_OFFSET_SECONDS}
        weather={DEMO_WEATHER}
        loading={loading}
      />
    </div>
  );
};
