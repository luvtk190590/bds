"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { NEARBY_CATEGORIES, formatDist } from "@/lib/nearbyConfig";

function createPoiIcon(categoryKey) {
  const cat = NEARBY_CATEGORIES.find((c) => c.key === categoryKey);
  const color = cat?.color ?? "#666";
  const iconClass = cat?.iconClass ?? "icon-mapPin";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff;cursor:pointer;"><i class="icon ${iconClass}" style="color:#fff;font-size:13px;"></i></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function AutoFit({ lat, lng, pois }) {
  const map = useMap();
  useEffect(() => {
    if (!pois.length) {
      map.setView([lat, lng], 15);
      return;
    }
    const bounds = L.latLngBounds([[lat, lng], ...pois.map((p) => [p.lat, p.lng])]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [pois, lat, lng, map]);
  return null;
}

export default function NearbyMapInner({ lat, lng, pois, radius, propertyTitle }) {
  const propertyIcon = L.divIcon({
    className: "",
    html: `<div style="background:#1a1a1a;color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 12px rgba(0,0,0,0.35);border:3px solid #fff;">🏠</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AutoFit lat={lat} lng={lng} pois={pois} />

      {/* Vòng tròn bán kính */}
      <Circle
        center={[lat, lng]}
        radius={radius}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: "6 4",
        }}
      />

      {/* Marker BĐS */}
      <Marker position={[lat, lng]} icon={propertyIcon}>
        <Popup>
          <strong style={{ fontSize: 13 }}>{propertyTitle || "Bất động sản"}</strong>
        </Popup>
      </Marker>

      {/* Markers POI */}
      {pois.map((poi) => (
        <Marker
          key={`${poi.id}-${poi.category}`}
          position={[poi.lat, poi.lng]}
          icon={createPoiIcon(poi.category)}
        >
          <Popup>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <strong>{poi.name}</strong>
              <br />
              <span style={{ color: "#888" }}>Cách {formatDist(poi.dist)}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
