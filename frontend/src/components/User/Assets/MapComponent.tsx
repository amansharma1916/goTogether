import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

interface MapComponentProps {
  pickupLocation?: LocationData | null;
  destinationLocation?: LocationData | null;
  onPickupClick?: (location: LocationData) => void;
  selectedRouteIndex?: number;
  onRouteSelect?: (index: number) => void;
  onRoutesUpdate?: (count: number) => void;
}

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || '';

const MapComponent = ({ 
  pickupLocation, 
  destinationLocation, 
  onPickupClick,
  selectedRouteIndex = 0,
  onRouteSelect,
  onRoutesUpdate
}: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const destinationMarker = useRef<maplibregl.Marker | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const mapClickHandler = useRef<((e: any) => void) | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [85.28644443808341, 23.33],
      zoom: 12,
    });

    // Add click event to map for setting pickup location
    if (onPickupClick) {
      // Change cursor to crosshair to indicate clickable
      if (mapContainer.current) {
        mapContainer.current.style.cursor = 'crosshair';
      }

      const clickHandler = async (e: any) => {
        // Check if click was on a route layer
        const features = map.current!.queryRenderedFeatures(e.point);
        const clickedOnRoute = features.some(feature => 
          feature.layer.id.startsWith('route-')
        );

        // Only handle pickup location if not clicking on a route
        if (!clickedOnRoute) {
          const { lng, lat } = e.lngLat;

          // Reverse geocode to get address name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            onPickupClick({ lat, lng, name });
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            // Fallback to coordinates if reverse geocoding fails
            onPickupClick({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          }
        }
      };

      mapClickHandler.current = clickHandler;
      map.current.on('click', clickHandler);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle pickup location updates
  useEffect(() => {
    if (!map.current || !pickupLocation) return;

    // Remove existing pickup marker if any
    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    // Create custom green marker element
    const el = document.createElement('div');
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundImage = `url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322C55E"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>')`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';

    // Add new pickup marker
    pickupMarker.current = new maplibregl.Marker({ element: el })
      .setLngLat([pickupLocation.lng, pickupLocation.lat])
      .setPopup(new maplibregl.Popup().setHTML(`<strong>Pickup:</strong><br/>${pickupLocation.name}`))
      .addTo(map.current);

    // Fly to pickup location
    map.current.flyTo({
      center: [pickupLocation.lng, pickupLocation.lat],
      zoom: 15,
      duration: 1500,
    });
  }, [pickupLocation]);

  // Handle destination location updates
  useEffect(() => {
    if (!map.current || !destinationLocation) return;

    // Remove existing destination marker if any
    if (destinationMarker.current) {
      destinationMarker.current.remove();
    }

    // Create custom red marker element
    const el = document.createElement('div');
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundImage = `url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EF4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>')`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';

    // Add new destination marker
    destinationMarker.current = new maplibregl.Marker({ element: el })
      .setLngLat([destinationLocation.lng, destinationLocation.lat])
      .setPopup(new maplibregl.Popup().setHTML(`<strong>Destination:</strong><br/>${destinationLocation.name}`))
      .addTo(map.current);

    // Fly to destination location
    map.current.flyTo({
      center: [destinationLocation.lng, destinationLocation.lat],
      zoom: 14,
      duration: 1500,
    });
  }, [destinationLocation]);

  // Fetch and display routes when both locations are set
  useEffect(() => {
    if (!map.current) return;

    // Clear routes if either location is missing
    if (!pickupLocation || !destinationLocation) {
      setRoutes([]);
      return;
    }

    const fetchRoutes = async () => {
      try {
        const response = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": ORS_API_KEY,
            },
            body: JSON.stringify({
              coordinates: [
                [pickupLocation.lng, pickupLocation.lat],
                [destinationLocation.lng, destinationLocation.lat]
              ],
              alternative_routes: {
                target_count: 3,
                share_factor: 0.6
              }
            }),
          }
        );

        const data = await response.json();
        console.log('Fetched routes:', data , selectedRouteIndex);
        if (data.features && data.features.length > 0) {
          setRoutes(data.features);
          if (onRoutesUpdate) {
            onRoutesUpdate(data.features.length);
          }
        } else {
          setRoutes([]);
          if (onRoutesUpdate) {
            onRoutesUpdate(0);
          }
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        setRoutes([]);
        if (onRoutesUpdate) {
          onRoutesUpdate(0);
        }
      }
    };

    fetchRoutes();
  }, [pickupLocation, destinationLocation]);

  // Update route count when routes are cleared
  useEffect(() => {
    if (routes.length === 0 && onRoutesUpdate) {
      onRoutesUpdate(0);
    }
  }, [routes]);

  // Disable/enable map click for origin when routes are shown
  useEffect(() => {
    if (!map.current || !mapClickHandler.current) return;

    if (routes.length > 0) {
      // Disable origin selection when routes are displayed
      map.current.off('click', mapClickHandler.current);
      if (mapContainer.current) {
        mapContainer.current.style.cursor = '';
      }
    } else {
      // Re-enable origin selection when no routes
      map.current.on('click', mapClickHandler.current);
      if (mapContainer.current) {
        mapContainer.current.style.cursor = 'crosshair';
      }
    }
  }, [routes]);

  // Draw routes on map
  useEffect(() => {
    if (!map.current) return;

    // Clean up existing route layers and sources (always, even if routes.length === 0)
    for (let i = 0; i < 5; i++) { // Clean up to 5 possible routes
      const layerId = `route-${i}`;
      const sourceId = `route-${i}`;
      
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    }

    // If no routes, we're done
    if (routes.length === 0) return;

    // Add route sources and layers
    routes.forEach((route, index) => {
      const sourceId = `route-${index}`;
      const layerId = `route-${index}`;
      
      // Add source
      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: route
      });

      // Define colors and widths based on route index and selection
      const isSelected = index === selectedRouteIndex;
      const colors = ['#4ADE80', '#F59E0B', '#3B82F6']; // Green, Amber, Blue
      const lineWidth = isSelected ? 6 : 4;
      const lineOpacity = isSelected ? 1 : 0.6;

      // Add layer
      map.current!.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': colors[index] || '#94a3b8',
          'line-width': lineWidth,
          'line-opacity': lineOpacity
        }
      });

      // Add click event to select route
      map.current!.on('click', layerId, () => {
        if (onRouteSelect) {
          onRouteSelect(index);
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current!.on('mouseleave', layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Fit map to show all routes
    if (routes.length > 0 && pickupLocation && destinationLocation) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([pickupLocation.lng, pickupLocation.lat]);
      bounds.extend([destinationLocation.lng, destinationLocation.lat]);
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1500
      });
    }
  }, [routes, selectedRouteIndex]);

  // Update route styling when selection changes
  useEffect(() => {
    if (!map.current || routes.length === 0) return;

    routes.forEach((_, index) => {
      const layerId = `route-${index}`;
      if (map.current!.getLayer(layerId)) {
        const isSelected = index === selectedRouteIndex;
        map.current!.setPaintProperty(layerId, 'line-width', isSelected ? 6 : 4);
        map.current!.setPaintProperty(layerId, 'line-opacity', isSelected ? 1 : 0.6);
      }
    });
  }, [selectedRouteIndex, routes]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "0",
        overflow: "hidden",
      }}
    />
  )
}

export default MapComponent;
