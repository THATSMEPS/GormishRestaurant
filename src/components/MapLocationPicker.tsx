
import React, { useState, useEffect, useRef } from 'react'; // useEffect bhi import kiya, added useRef
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';


// Use a default Leaflet icon with a custom divIcon using lucide-react icon
const customMarkerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="color: #6552FF; font-size: 32px;"><svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin" viewBox="0 0 24 24"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});


interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  address?: string; // New prop for forward geocoding
  // Callback function jo selected location details return karegi
  onLocationSelect?: (lat: number, lng: number, address: string) => void; // onLocationSelect add kiya tha
  onAreaSelect?: (bounds: L.LatLngBounds) => void; // New callback for area selection
}

const MapLocationPicker: React.FC<MapPickerProps> = ({
  initialLat = 23.237560, // Default: Gandhinagar, Gujarat ka latitude
  initialLng = 72.647781, // Default: Gandhinagar, Gujarat ka longitude
  initialZoom = 14, // Default zoom level
  address: propAddress, // Destructure the new address prop
  onLocationSelect, // Destructure the callback
  onAreaSelect, // Destructure area select callback
}) => {
  const [position, setPosition] = useState<L.LatLngTuple | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // For area selection
  const [areaBounds, setAreaBounds] = useState<L.LatLngBounds | null>(null);
  const isDraggingRef = useRef(false);
  const longPressTimeoutRef = useRef<number | null>(null);
  const startPointRef = useRef<L.LatLng | null>(null);

  // Set initial position on mount or when initialLat/initialLng changes
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  /*
  // Forward geocoding when propAddress changes
  useEffect(() => {
    if (propAddress && propAddress.trim() !== '') {
      fetch(`/api/restaurants/geocode?address=${encodeURIComponent(propAddress)}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setPosition([lat, lon]);
            setAddress(propAddress);
            if (onLocationSelect) {
              onLocationSelect(lat, lon, propAddress);
            }
          }
        })
        .catch(error => {
          console.error("Error while forward geocoding address:", error);
        });
    }
  }, [propAddress]);
  */

  const MapEventsHandler = () => {
    const map = useMapEvents({
      mousedown: (e) => {
        console.log('Map mousedown event:', e.latlng);
        e.originalEvent.preventDefault();
        // Start long press timer
        longPressTimeoutRef.current = setTimeout(() => {
          console.log('Long press timer fired, starting drag');
          isDraggingRef.current = true;
          startPointRef.current = e.latlng;
          setAreaBounds(null); // reset previous area
          map.dragging.disable();
        }, 600); // 600ms for long press
      },
      mouseup: (e) => {
        console.log('Map mouseup event:', e.latlng);
        // Clear long press timer
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }
        if (isDraggingRef.current) {
          console.log('Finishing drag');
          // Finish dragging, finalize area selection
          isDraggingRef.current = false;
          if (startPointRef.current) {
            const bounds = L.latLngBounds(startPointRef.current, e.latlng);
            setAreaBounds(bounds);
            if (onAreaSelect) {
              onAreaSelect(bounds);
            }
          }
          startPointRef.current = null;
          map.dragging.enable();
        }
      },
      mousemove: (e) => {
        if (isDraggingRef.current && startPointRef.current) {
          console.log('Dragging, updating bounds:', e.latlng);
          // Update rectangle bounds while dragging
          const bounds = L.latLngBounds(startPointRef.current, e.latlng);
          setAreaBounds(bounds);
        }
      },
      click: (e) => {
        console.log('Map click event:', e.latlng);
        // If not dragging, treat as single click to select point
        if (!isDraggingRef.current) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          setAreaBounds(null); // clear any area selection

fetch(`/api/restaurants/reverse-geocode?lat=${lat}&lon=${lng}`)
            .then(async response => {
              const text = await response.text();
              if (!response.ok) {
                console.error("Non-OK response from reverse geocode API:", text);
                throw new Error("Non-OK response from reverse geocode API");
              }
              try {
                return JSON.parse(text);
              } catch (jsonError) {
                console.error("Error parsing JSON from reverse geocode API:", jsonError, "Response text:", text);
                throw jsonError;
              }
            })
            .then(data => {
              const fetchedAddress = data && data.data && data.data.display_name ? data.data.display_name : "Address nahi mila";
              setAddress(fetchedAddress);
              if (onLocationSelect) {
                onLocationSelect(lat, lng, fetchedAddress);
              }
            })
            .catch(error => {
              console.error("Error while fetching address:", error);
              setAddress("Error in address fetching.");
              if (onLocationSelect) {
                onLocationSelect(lat, lng, "");
              }
            });
        }
      },
      // To support touch devices, add touch events
      // @ts-ignore
      touchstart: (e: any) => {
        console.log('Map touchstart event');
        if (e.touches && e.touches.length === 1) {
          const touch = e.touches[0];
          const latlng = map.containerPointToLatLng(L.point(touch.clientX, touch.clientY));
          longPressTimeoutRef.current = window.setTimeout(() => {
            console.log('Long press timer fired on touch, starting drag');
            isDraggingRef.current = true;
            startPointRef.current = latlng;
            setAreaBounds(null);
            map.dragging.disable();
          }, 600);
        }
      },
      // @ts-ignore
      touchend: (e: any) => {
        console.log('Map touchend event');
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }
        if (isDraggingRef.current) {
          console.log('Finishing drag on touchend');
          isDraggingRef.current = false;
          if (startPointRef.current) {
            const bounds = L.latLngBounds(startPointRef.current, map.containerPointToLatLng(map.mouseEventToContainerPoint(e)));
            setAreaBounds(bounds);
            if (onAreaSelect) {
              onAreaSelect(bounds);
            }
          }
          startPointRef.current = null;
          map.dragging.enable();
        }
      },
      // @ts-ignore
      touchmove: (e: any) => {
        if (isDraggingRef.current && e.touches && e.touches.length === 1) {
          console.log('Dragging on touchmove');
          const touch = e.touches[0];
          const latlng = map.containerPointToLatLng(L.point(touch.clientX, touch.clientY));
          const bounds = L.latLngBounds(startPointRef.current!, latlng);
          setAreaBounds(bounds);
        }
      },
    });
    return null;
  };

  return (
    <div
      className="w-full h-[450px] rounded-lg border border-gray-200 overflow-hidden"
      style={{
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <MapContainer 
        center={position || [initialLat, initialLng]} // Agar position set nahi hai, toh initial use karein
        zoom={initialZoom}
        scrollWheelZoom={true}
        dragging={true}
        attributionControl={false} // Disable attribution control to hide Leaflet/OpenStreetMap text
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler />

        {position && (
          // ✅ UPDATED: Marker ke icon prop mein customMarkerIcon pass kiya gaya hai
          <Marker position={position} icon={customMarkerIcon}>
            <Popup>
              <b>Selected Location:</b><br/>
              Latitude: {position[0].toFixed(6)}<br/>
              Longitude: {position[1].toFixed(6)}<br/>
              {address && `Address: ${address}`}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapLocationPicker;
