import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

function ViewportTracker({ onViewportChange }) {
  const map = useMapEvents({
    moveend: update,
    zoomend: update,
  });

  function update() {
    const center = map.getCenter();
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const distanceKm = ne.distanceTo(sw) / 1000;
    const radiusKm = distanceKm / 2;

    onViewportChange({
      center: [center.lat, center.lng],
      radius: Number(radiusKm.toFixed(2)),
      bounds: {
        ne: [ne.lat, ne.lng],
        sw: [sw.lat, sw.lng],
      },
    });
  }

  return null;
}

export default function Map() {
  const [chargers, setChargers] = useState([]);
  const [viewport, setViewport] = useState({
    center: [37.7749, -122.4194],
    radius: 10,
    bounds: {
      ne: [0, 0],
      sw: [0, 0],
    },
  });

  useEffect(() => {
    async function fetchChargers() {
      const { center, radius, bounds } = viewport;
      console.log("Center:", center);
      console.log("Radius:", radius);
      console.log("Bounds NE:", bounds.ne, "SW:", bounds.sw);

      const res = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&boundingbox=${southLat},${westLng},${northLat},${eastLng}&distanceunit=KM&maxresults=10000&key=5070ea38-a012-4df7-91ee-cd04943bbc2d`);
      const data = await res.json();
      setChargers(data);
    }

    fetchChargers();
  }, [viewport]);

  return (
    <MapContainer center={[37.7749, -122.4194]} zoom={12} style={{ height: '100vh', width: '100%' }}>
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