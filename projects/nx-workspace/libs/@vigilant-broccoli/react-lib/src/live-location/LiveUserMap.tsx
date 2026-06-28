'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SharingUser } from './live-location.types';

export type { SharingUser } from './live-location.types';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const DEFAULT_ZOOM = 12;
const WINDOW_TARGET_BLANK = '_blank';
const FALLBACK_CENTER: [number, number] = [0, 0];

export interface LiveUserMapProps {
  users: SharingUser[];
  currentUserId: string;
  youLabel: string;
  openInMapsLabel: string;
}

export function LiveUserMap({
  users,
  currentUserId,
  youLabel,
  openInMapsLabel,
}: LiveUserMapProps) {
  const center: [number, number] = users[0]
    ? [users[0].lat, users[0].lng]
    : FALLBACK_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {users.map(user => (
        <Marker key={user.userId} position={[user.lat, user.lng]} icon={icon}>
          <Popup>
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">
                {user.userId === currentUserId ? youLabel : user.username}
              </span>
              <a
                href={`${GOOGLE_MAPS_BASE}${user.lat},${user.lng}`}
                target={WINDOW_TARGET_BLANK}
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {openInMapsLabel}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
