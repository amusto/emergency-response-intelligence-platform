import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type {
  Facility,
  Incident,
  LayerKey,
  MapFocusTarget,
  Resource,
  SelectedEntity,
} from '../types';
import {
  facilityOpacity,
  FACILITY_COLOR,
  incidentColor,
  resourceColor,
} from '../lib/style';

interface Props {
  incidents: Incident[];
  resources: Resource[];
  facilities: Facility[];
  visibleLayers: Record<LayerKey, boolean>;
  selected: SelectedEntity;
  focus: MapFocusTarget | null;
  onSelect: (entity: SelectedEntity) => void;
}

/** Imperatively flies the map whenever a new focus target arrives. */
function MapFocus({ focus }: { focus: MapFocusTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
  }, [focus, map]);
  return null;
}

// San Francisco operating area.
const CENTER: [number, number] = [37.7749, -122.4294];
const ZOOM = 13;

function isSelected(selected: SelectedEntity, kind: string, id: string): boolean {
  return selected?.kind === kind && selected.data.id === id;
}

export default function OperationalMap({
  incidents,
  resources,
  facilities,
  visibleLayers,
  selected,
  focus,
  onSelect,
}: Props) {
  return (
    <MapContainer center={CENTER} zoom={ZOOM} className="map" zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapFocus focus={focus} />

      {visibleLayers.facilities &&
        facilities.map((f) => (
          <CircleMarker
            key={f.id}
            center={[f.latitude, f.longitude]}
            radius={isSelected(selected, 'facility', f.id) ? 11 : 8}
            pathOptions={{
              color: '#ffffff',
              weight: isSelected(selected, 'facility', f.id) ? 3 : 1,
              fillColor: FACILITY_COLOR,
              fillOpacity: facilityOpacity(f),
            }}
            eventHandlers={{ click: () => onSelect({ kind: 'facility', data: f }) }}
          >
            <Tooltip>
              {f.name} — {f.status}
            </Tooltip>
          </CircleMarker>
        ))}

      {visibleLayers.resources &&
        resources.map((r) => (
          <CircleMarker
            key={r.id}
            center={[r.latitude, r.longitude]}
            radius={isSelected(selected, 'resource', r.id) ? 9 : 6}
            pathOptions={{
              color: '#ffffff',
              weight: isSelected(selected, 'resource', r.id) ? 3 : 1,
              fillColor: resourceColor(r),
              fillOpacity: r.status === 'OutOfService' ? 0.35 : 0.95,
            }}
            eventHandlers={{ click: () => onSelect({ kind: 'resource', data: r }) }}
          >
            <Tooltip>
              {r.unitNumber} ({r.type}) — {r.status}
            </Tooltip>
          </CircleMarker>
        ))}

      {visibleLayers.incidents &&
        incidents.map((i) => (
          <CircleMarker
            key={i.id}
            center={[i.location.latitude, i.location.longitude]}
            radius={isSelected(selected, 'incident', i.id) ? 14 : 10}
            pathOptions={{
              color: '#ffffff',
              weight: isSelected(selected, 'incident', i.id) ? 3 : 1.5,
              fillColor: incidentColor(i),
              fillOpacity: i.status === 'Resolved' ? 0.3 : 0.9,
            }}
            eventHandlers={{ click: () => onSelect({ kind: 'incident', data: i }) }}
          >
            <Tooltip>
              {i.priority} {i.type} — {i.status}
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
