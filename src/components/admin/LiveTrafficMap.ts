// src/components/admin/LiveTrafficMap.ts
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

interface TrafficData {
  id: number;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  trafficVolume: number;
}

interface LiveTrafficMapProps {
  // Add props if needed
}

const LiveTrafficMap: React.FC<LiveTrafficMapProps> = () => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await axios.get('/api/admin/analytics/traffic');
        setTrafficData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTrafficData();
  }, []);

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
  });

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {trafficData.map((traffic) => (
        <Marker
          key={traffic.id}
          icon={icon}
          position={[traffic.latitude, traffic.longitude]}
        >
          <Popup>
            <h2>
              {traffic.city}, {traffic.country}
            </h2>
            <p>Traffic Volume: {traffic.trafficVolume}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LiveTrafficMap;