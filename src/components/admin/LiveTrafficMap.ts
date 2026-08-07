// src/components/admin/LiveTrafficMap.ts
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { GeoLocation } from '../types/index';

interface LiveTrafficMapProps {
  height: number;
  width: number;
}

const LiveTrafficMap: React.FC<LiveTrafficMapProps> = ({ height, width }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);
  const [trafficData, setTrafficData] = useState<GeoLocation[]>([]);
  const [markerIcon, setMarkerIcon] = useState<L.Icon>();

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

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    setMarkerIcon(icon);
  }, []);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {trafficData.map((location, index) => (
        <Marker
          key={index}
          icon={markerIcon}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <b>Location:</b> {location.city}, {location.country}
            <br />
            <b>Visits:</b> {location.visits}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LiveTrafficMap;