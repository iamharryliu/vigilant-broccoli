'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LiveUser } from '../../hooks/useLiveLocations';

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
const YOU_LABEL = 'You';
const OPEN_IN_GOOGLE_MAPS = 'Open in Google Maps';

interface LiveUserMapProps {
  users: LiveUser[];
  currentUserId: string;
}

export function LiveUserMap({ users, currentUserId }: LiveUserMapProps) {
  const center = users[0]
    ? ([users[0].lat, users[0].lng] as [number, number])
    : ([0, 0] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
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
                {user.userId === currentUserId ? YOU_LABEL : user.userId}
              </span>
              <a
                href={`${GOOGLE_MAPS_BASE}${user.lat},${user.lng}`}
                target={WINDOW_TARGET_BLANK}
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {OPEN_IN_GOOGLE_MAPS}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
