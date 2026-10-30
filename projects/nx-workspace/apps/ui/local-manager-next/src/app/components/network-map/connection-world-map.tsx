'use client';

import 'leaflet/dist/leaflet.css';
import { Fragment, useEffect } from 'react';
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import {
  CONNECTION_DIRECTION,
  ConnectionDirection,
  ConnectionMapResponse,
} from '../../constants/network-monitor';
import {
  Destination,
  LatLng,
  dominantDirection,
  formatPlace,
  greatCircleArc,
} from './network-map.utils';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
// OSM has no keyless dark style (CARTO's now needs an API key), so the light
// tiles are inverted to keep the arcs readable. Set on the pane directly rather
// than via Tailwind so it doesn't depend on Next's CSS cache picking it up.
const TILE_PANE = 'tilePane';
const TILE_FILTER =
  'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9)';
// DB-IP Lite is CC BY 4.0, which requires this attribution wherever its data
// is shown.
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://db-ip.com">IP Geolocation by DB-IP</a>';
const FALLBACK_CENTER: LatLng = [20, 0];
const DEFAULT_ZOOM = 2;
const MIN_ZOOM = 2;
const HOME_COLOR = '#4ade80';
const HOME_LABEL = 'This machine';
const MAX_TOOLTIP_PROCESSES = 6;
const FADE_WINDOW_MS = 15 * 60 * 1000;
const ACTIVE_OPACITY = 0.9;
const MIN_IDLE_OPACITY = 0.15;
const MAX_IDLE_OPACITY = 0.5;
const DIMMED_OPACITY = 0.06;

const DIRECTION_COLOR: Record<ConnectionDirection, string> = {
  [CONNECTION_DIRECTION.OUTBOUND]: '#38bdf8',
  [CONNECTION_DIRECTION.INBOUND]: '#fb923c',
};

const destinationOpacity = (d: Destination, now: number) => {
  if (d.activeSockets > 0) return ACTIVE_OPACITY;
  const ageRatio = Math.min(1, (now - d.lastSeen) / FADE_WINDOW_MS);
  return MAX_IDLE_OPACITY - ageRatio * (MAX_IDLE_OPACITY - MIN_IDLE_OPACITY);
};

const DestinationTooltip = ({ destination }: { destination: Destination }) => {
  const processes = [...new Set(destination.flows.map(f => f.process))];
  const ips = [...new Set(destination.flows.map(f => f.remoteIp))];
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-semibold">{formatPlace(destination.location)}</span>
      <span>
        {processes.slice(0, MAX_TOOLTIP_PROCESSES).join(', ')}
        {processes.length > MAX_TOOLTIP_PROCESSES &&
          ` +${processes.length - MAX_TOOLTIP_PROCESSES}`}
      </span>
      <span className="font-mono opacity-70">
        {ips.length === 1 ? ips[0] : `${ips.length} IPs`} ·{' '}
        {destination.flows.length} flow
        {destination.flows.length === 1 ? '' : 's'}
      </span>
    </div>
  );
};

// Also re-measures on resize: Leaflet sizes its container once at init, and
// the card can mount before its layout settles, leaving no tiles requested.
const MapSetup = () => {
  const map = useMap();
  useEffect(() => {
    const tilePane = map.getPane(TILE_PANE);
    if (tilePane) tilePane.style.filter = TILE_FILTER;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
};

interface ConnectionWorldMapProps {
  home: ConnectionMapResponse['home'];
  destinations: Destination[];
  highlightedKeys: Set<string> | null;
  now: number;
}

export const ConnectionWorldMap = ({
  home,
  destinations,
  highlightedKeys,
  now,
}: ConnectionWorldMapProps) => {
  const homePoint: LatLng | null = home ? [home.lat, home.lng] : null;

  return (
    <MapContainer
      center={homePoint ?? FALLBACK_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      worldCopyJump
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <MapSetup />
      <TileLayer attribution={ATTRIBUTION} url={TILE_URL} />
      {destinations.map(d => {
        const dimmed = highlightedKeys !== null && !highlightedKeys.has(d.key);
        const opacity = dimmed ? DIMMED_OPACITY : destinationOpacity(d, now);
        const color = DIRECTION_COLOR[dominantDirection(d)];
        const point: LatLng = [d.location.lat, d.location.lng];
        return (
          <Fragment key={d.key}>
            {homePoint && (
              <Polyline
                positions={greatCircleArc(homePoint, point)}
                pathOptions={{
                  color,
                  opacity,
                  weight: 1 + Math.log2(d.flows.length + 1),
                }}
              />
            )}
            <CircleMarker
              center={point}
              radius={3 + Math.sqrt(d.flows.length) * 2}
              pathOptions={{
                color,
                fillColor: color,
                opacity,
                fillOpacity: opacity * 0.6,
                weight: 1,
              }}
            >
              <Tooltip>
                <DestinationTooltip destination={d} />
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
      {homePoint && home && (
        <CircleMarker
          center={homePoint}
          radius={6}
          pathOptions={{
            color: HOME_COLOR,
            fillColor: HOME_COLOR,
            fillOpacity: 0.9,
          }}
        >
          <Tooltip>
            <div className="flex flex-col text-xs">
              <span className="font-semibold">{HOME_LABEL}</span>
              <span>{formatPlace(home)}</span>
              <span className="font-mono opacity-70">{home.ip}</span>
            </div>
          </Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
};
