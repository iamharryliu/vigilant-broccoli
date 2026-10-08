'use client';

import { NEARBY_RADIUS_METRES } from '../consts/nearby.consts';
import { NEARBY_STATUS, NearbyStatus } from '../hooks/useNearbyPlaces';
import { PlaceWithDistance } from '../../lib/overpass';
import { useTranslation } from '../i18n';

const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';
const WINDOW_TARGET_BLANK = '_blank';
const BUTTON_CLASS =
  'rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50';

interface NearbyTabProps {
  places: PlaceWithDistance[];
  status: NearbyStatus;
  hasLoaded: boolean;
  hasLocation: boolean;
  onRefresh: () => void;
  onShowOnMap: (place: PlaceWithDistance) => void;
}

export function NearbyTab({
  places,
  status,
  hasLoaded,
  hasLocation,
  onRefresh,
  onShowOnMap,
}: NearbyTabProps) {
  const { t } = useTranslation();
  const isLoading = status === NEARBY_STATUS.LOADING;
  const hasError = status === NEARBY_STATUS.ERROR;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-700">
          {t('NEARBY.TITLE', { radius: NEARBY_RADIUS_METRES })}
        </h2>
        <button
          type="button"
          className={BUTTON_CLASS}
          disabled={!hasLocation || isLoading}
          onClick={onRefresh}
        >
          {t('NEARBY.REFRESH')}
        </button>
      </div>

      {!hasLocation && (
        <p role="status" className="text-sm text-gray-500">
          {t('NEARBY.LOCATION_UNAVAILABLE')}
        </p>
      )}

      {hasLocation && isLoading && (
        <p role="status" className="text-sm text-gray-500">
          {t('NEARBY.LOADING')}
        </p>
      )}

      {hasLocation && hasError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <span>
            {hasLoaded ? t('NEARBY.ERROR_CACHED') : t('NEARBY.ERROR')}
          </span>
          <button type="button" className={BUTTON_CLASS} onClick={onRefresh}>
            {t('NEARBY.RETRY')}
          </button>
        </div>
      )}

      {hasLocation && hasLoaded && places.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">
          {t('NEARBY.EMPTY', { radius: NEARBY_RADIUS_METRES })}
        </p>
      )}

      {hasLocation && places.length > 0 && (
        <ul className="flex flex-col gap-2">
          {places.map(place => {
            const category = t(`NEARBY.CATEGORY.${place.category}`);
            return (
              <li
                key={place.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {place.name ?? t('NEARBY.UNNAMED', { category })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {category} · {place.subtype}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    {t('NEARBY.DISTANCE', {
                      distance: Math.round(place.distanceMetres),
                    })}
                  </span>
                  <button
                    type="button"
                    className={BUTTON_CLASS}
                    onClick={() => onShowOnMap(place)}
                  >
                    {t('NEARBY.SHOW_ON_MAP')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-gray-400">
        {t('NEARBY.APPROXIMATE')} {t('NEARBY.ATTRIBUTION_PREFIX')}{' '}
        <a
          href={OSM_COPYRIGHT_URL}
          target={WINDOW_TARGET_BLANK}
          rel="noreferrer"
          className="underline"
        >
          {t('NEARBY.ATTRIBUTION_LINK')}
        </a>
        .
      </p>
    </div>
  );
}
