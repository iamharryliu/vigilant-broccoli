'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { SharingUser } from '../hooks/useLiveLocations';
import { Coordinates } from '../../lib/geo';
import { PlaceWithDistance } from '../../lib/overpass';
import { useTranslation } from '../i18n';

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const WINDOW_TARGET_BLANK = '_blank';
const MARKER_ICON_BASE = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ZOOM = 15;
const POI_ZOOM = 18;
const FALLBACK_CENTER: [number, number] = [0, 0];

const createIcon = (className?: string) =>
  L.icon({
    iconUrl: `${MARKER_ICON_BASE}marker-icon.png`,
    iconRetinaUrl: `${MARKER_ICON_BASE}marker-icon-2x.png`,
    shadowUrl: `${MARKER_ICON_BASE}marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className,
  });

const userIcon = createIcon();
const selfIcon = createIcon('findme-self-marker');
const poiIcon = createIcon('findme-poi-marker');

export interface FocusedPoi {
  requestKey: number;
  place: PlaceWithDistance;
}

interface FindMeMapProps {
  self: Coordinates | null;
  users: SharingUser[];
  currentUserId: string;
  active: boolean;
  poi: FocusedPoi | null;
  poiName: string;
  poiCategory: string;
}

function MapSync({
  active,
  self,
  poi,
}: Pick<FindMeMapProps, 'active' | 'self' | 'poi'>) {
  const map = useMap();
  const hasCentredRef = useRef(false);
  const focusedKeyRef = useRef<number | null>(null);

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (!active) return;
    map.invalidateSize();
    if (poi && focusedKeyRef.current !== poi.requestKey) {
      focusedKeyRef.current = poi.requestKey;
      hasCentredRef.current = true;
      map.setView([poi.place.lat, poi.place.lng], POI_ZOOM, { animate: false });
      return;
    }
    if (!hasCentredRef.current && self) {
      hasCentredRef.current = true;
      map.setView([self.lat, self.lng], DEFAULT_ZOOM, { animate: false });
    }
  }, [active, self, poi, map]);

  return null;
}

function PoiMarker({
  poi,
  active,
  name,
  category,
}: {
  poi: FocusedPoi;
  active: boolean;
  name: string;
  category: string;
}) {
  const { t } = useTranslation();
  const markerRef = useRef<L.Marker | null>(null);
  const openedKeyRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || openedKeyRef.current === poi.requestKey) return;
    openedKeyRef.current = poi.requestKey;
    markerRef.current?.openPopup();
  }, [active, poi.requestKey]);

  return (
    <Marker
      ref={markerRef}
      position={[poi.place.lat, poi.place.lng]}
      icon={poiIcon}
    >
      <Popup>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">{name}</span>
          <span>{category}</span>
          <span>
            {t('NEARBY.DISTANCE_AWAY', {
              distance: Math.round(poi.place.distanceMetres),
            })}
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

export function FindMeMap({
  self,
  users,
  currentUserId,
  active,
  poi,
  poiName,
  poiCategory,
}: FindMeMapProps) {
  const { t } = useTranslation();
  const others = users.filter(user => user.userId !== currentUserId);
  const initialCenter: [number, number] = self
    ? [self.lat, self.lng]
    : others[0]
      ? [others[0].lat, others[0].lng]
      : FALLBACK_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <MapSync active={active} self={self} poi={poi} />
      {self && (
        <Marker position={[self.lat, self.lng]} icon={selfIcon}>
          <Popup>
            <span className="text-sm font-semibold">{t('USER.YOU_LABEL')}</span>
          </Popup>
        </Marker>
      )}
      {others.map(user => (
        <Marker
          key={user.userId}
          position={[user.lat, user.lng]}
          icon={userIcon}
        >
          <Popup>
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">{user.username}</span>
              <a
                href={`${GOOGLE_MAPS_BASE}${user.lat},${user.lng}`}
                target={WINDOW_TARGET_BLANK}
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {t('SHARING.OPEN_IN_GOOGLE_MAPS')}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
      {poi && (
        <PoiMarker
          poi={poi}
          active={active}
          name={poiName}
          category={poiCategory}
        />
      )}
    </MapContainer>
  );
}
