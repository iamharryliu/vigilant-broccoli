import { WeatherView } from '../components/weather-view';
import { ProtectedRoute } from '../components/protected-route';
import { PAGE_MIN_HEIGHT } from '../components/app-shell.constants';
import { PAGE_TITLE } from '../app.const';

export const metadata = {
  title: PAGE_TITLE.WEATHER,
};

export default function WeatherPage() {
  return (
    <ProtectedRoute>
      <main className={`${PAGE_MIN_HEIGHT} bg-gray-50`}>
        <div className="px-4 py-5">
          <WeatherView />
        </div>
      </main>
    </ProtectedRoute>
  );
}
