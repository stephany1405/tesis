import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";
import debounce from "lodash/debounce";
import styles from "../bolsa/bolsa.module.css";
import "leaflet/dist/leaflet.css";
import "../inicio/hooks/mapIcon.js";

const AREA_BOUNDS = [
  [10.1, -67.2],
  [10.7, -66.0],
];

const DEFAULT_CENTER = [10.4806, -66.9036];

function isWithinAllowedArea(lat, lng) {
  return (
    lat >= AREA_BOUNDS[0][0] &&
    lat <= AREA_BOUNDS[1][0] &&
    lng >= AREA_BOUNDS[0][1] &&
    lng <= AREA_BOUNDS[1][1]
  );
}

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
      map.invalidateSize();
    }
  }, [center, zoom, map]);

  return null;
}

function LocationMarker({ onLocationSelect, onError }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      if (!isWithinAllowedArea(lat, lng)) {
        onError("Solo se permiten ubicaciones dentro de Caracas y Miranda");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/geocode/reverse",
          {
            params: {
              lat: lat,
              lon: lng,
            },
          }
        );

        if (response.data && response.data.display_name) {
          const address = response.data.display_name.toLowerCase();
          if (!address.includes("caracas") && !address.includes("miranda")) {
            onError(
              "La ubicación seleccionada debe estar en Caracas o Miranda"
            );
            return;
          }

          onLocationSelect({
            lat,
            lng,
            address: response.data.display_name,
          });
        }
      } catch (err) {
        console.error("Error al obtener la dirección:", err);
        onError("Error al obtener la dirección");
      }
    },
  });

  return null;
}

export const AddressForm = ({
  onLocationSelect,
  onFormValidityChange = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey((prev) => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isValid =
      selectedLocation &&
      isWithinAllowedArea(selectedLocation.lat, selectedLocation.lng);
    onFormValidityChange(isValid);
  }, [selectedLocation, onFormValidityChange]);

  const getAddressSuggestions = debounce(async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3000/api/geocode/search",
        {
          params: {
            q: `${query} (Caracas OR Miranda)`,
            viewbox: `${AREA_BOUNDS[0][1]},${AREA_BOUNDS[0][0]},${AREA_BOUNDS[1][1]},${AREA_BOUNDS[1][0]}`,
            bounded: 1,
          },
        }
      );

      const filteredSuggestions = (
        Array.isArray(response.data) ? response.data : []
      ).filter((suggestion) => {
        const address = suggestion.display_name.toLowerCase();
        return (
          (address.includes("caracas") || address.includes("miranda")) &&
          isWithinAllowedArea(
            parseFloat(suggestion.lat),
            parseFloat(suggestion.lon)
          )
        );
      });

      setSuggestions(filteredSuggestions);
    } catch (err) {
      console.error("Error buscando direcciones:", err);
      setError("Error al buscar direcciones");
      setSuggestions([]);
    }
  }, 300);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setError("");
    getAddressSuggestions(e.target.value);
  };

  const handleSelectLocation = (location) => {
    const coords = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
    };

    if (!isWithinAllowedArea(coords.lat, coords.lng)) {
      setError("Solo se permiten ubicaciones dentro de Caracas y Miranda");
      onFormValidityChange(false);
      return;
    }

    const address = location.display_name.toLowerCase();
    if (!address.includes("caracas") && !address.includes("miranda")) {
      setError("La ubicación debe estar en Caracas o Miranda");
      onFormValidityChange(false);
      return;
    }

    setSelectedLocation({
      ...coords,
      address: location.display_name,
    });

    setSuggestions([]);
    setSearchQuery(location.display_name);
    setMapKey((prev) => prev + 1);
    onFormValidityChange(true);

    onLocationSelect({
      address: location.display_name,
      coordinates: coords,
    });
  };

  const handleMapClick = (location) => {
    const isValid = isWithinAllowedArea(location.lat, location.lng);
    setSelectedLocation(location);
    setSearchQuery(location.address);
    setSuggestions([]);
    onFormValidityChange(isValid);

    onLocationSelect({
      address: location.address,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
    });
  };

  const handleMapError = (errorMessage) => {
    setError(errorMessage);
    onFormValidityChange(false);
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError("");
    setLoadingText("Obteniendo tu ubicación...");

    try {
      if (!navigator.geolocation) {
        throw new Error("Tu navegador no soporta geolocalización");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      if (
        !isWithinAllowedArea(
          position.coords.latitude,
          position.coords.longitude
        )
      ) {
        throw new Error("Tu ubicación actual está fuera de Caracas y Miranda");
      }

      setLoadingText("Buscando dirección...");

      const response = await axios.get(
        "http://localhost:3000/api/geocode/reverse",
        {
          params: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        }
      );

      if (!response.data || !response.data.display_name) {
        throw new Error("No se pudo obtener la dirección de la ubicación");
      }

      const address = response.data.display_name.toLowerCase();
      if (!address.includes("caracas") && !address.includes("miranda")) {
        throw new Error("Tu ubicación actual está fuera de Caracas y Miranda");
      }

      const locationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: response.data.display_name,
      };

      setSelectedLocation(locationData);
      setSearchQuery(response.data.display_name);
      setMapKey((prev) => prev + 1);
      onFormValidityChange(true);

      onLocationSelect({
        address: response.data.display_name,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      });
    } catch (err) {
      console.error("Error detallado:", err);
      if (err.code === 1) {
        setError(
          "Permiso de ubicación denegado. Por favor habilita el acceso a tu ubicación."
        );
      } else if (err.code === 2) {
        setError(
          "No se pudo obtener la ubicación. Asegúrate de tener el GPS activado y estar conectado a internet."
        );
      } else if (err.code === 3) {
        setError("Tiempo de espera agotado. Por favor intenta de nuevo.");
      } else {
        setError(err.message || "Error al obtener la ubicación");
      }
      onFormValidityChange(false);
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className={styles.addressFormContainer}>
      <div className={styles.searchContainer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar dirección en Caracas o Miranda..."
            className={styles.searchInput}
            disabled={isLoading}
          />
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className={styles.locationButton}
          >
            {isLoading ? loadingText : "Mi Ubicación"}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSelectLocation(suggestion)}
                className={styles.suggestionItem}
              >
                {suggestion.display_name}
              </div>
            ))}
          </div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      <div className={styles.mapContainer}>
        <MapContainer
          key={mapKey}
          center={
            selectedLocation
              ? [selectedLocation.lat, selectedLocation.lng]
              : DEFAULT_CENTER
          }
          zoom={11}
          style={{ height: "500px", width: "100%" }}
          maxBounds={AREA_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={10}
          whenCreated={(map) => {
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            bounds={AREA_BOUNDS}
          />

          <LocationMarker
            onLocationSelect={handleMapClick}
            onError={handleMapError}
          />

          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
          )}
          <MapController
            center={
              selectedLocation
                ? [selectedLocation.lat, selectedLocation.lng]
                : null
            }
            zoom={11}
          />
        </MapContainer>
      </div>
    </div>
  );
};
