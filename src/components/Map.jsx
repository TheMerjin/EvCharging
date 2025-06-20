
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// This component tracks the center and radius of the visible map
function ViewportTracker({ onViewportChange }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const distanceKm = ne.distanceTo(sw) / 1000; // meters to km
      const radiusKm = distanceKm / 2;

      onViewportChange({
        center: [center.lat, center.lng],
        radius: radiusKm,
      });
    },
    zoomend: () => {
      // Also update on zoom
      const center = map.getCenter();
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const distanceKm = ne.distanceTo(sw) / 1000;
      const radiusKm = distanceKm / 2;

      onViewportChange({
        center: [center.lat, center.lng],
        radius: radiusKm,
      });
    }
  });

  return null;
}

export default function Map() {
  const [chargers, setChargers] = useState([]);
  const [viewport, setViewport] = useState({
    center: [37.7749, -122.4194],
    radius: 10, // initial radius km
  });

  useEffect(() => {
    async function fetchChargers() {
      const { center, radius } = viewport;
      const res = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${center[0]}&longitude=${center[1]}&distance=${radius}&distanceunit=KM&maxresults=50&key=5070ea38-a012-4df7-91ee-cd04943bbc2d`);
      const data = await res.json();
      setChargers(data);
    }
    fetchChargers();
  }, [viewport]);

  return (
    <MapContainer center={viewport.center} zoom={12} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ViewportTracker onViewportChange={setViewport} />
      {chargers.map((charger, idx) => (
        <Marker
          key={idx}
          position={[
            charger.AddressInfo.Latitude,
            charger.AddressInfo.Longitude
          ]}
        >
          <Popup>
            {charger.AddressInfo.Title}<br />
            {charger.AddressInfo.AddressLine1}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}