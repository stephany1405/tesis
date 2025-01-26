import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import axios from "axios";
import debounce from "lodash/debounce";
import styles from "./bolsa.module.css";
import "leaflet/dist/leaflet.css";
import "../inicio/hooks/mapIcon.js";

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

  const defaultCenter = [10.4806, -66.9036]; // Caracas

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey((prev) => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Efecto para validar el formulario cuando cambia la ubicación seleccionada
  useEffect(() => {
    onFormValidityChange(!!selectedLocation);
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
          params: { q: query },
        }
      );
      setSuggestions(Array.isArray(response.data) ? response.data : []);
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

    setSelectedLocation({
      ...coords,
      address: location.display_name,
    });

    setSuggestions([]);
    setSearchQuery(location.display_name);
    setMapKey((prev) => prev + 1);

    onLocationSelect({
      address: location.display_name,
      coordinates: coords,
    });
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

      const locationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: response.data.display_name,
      };

      setSelectedLocation(locationData);
      setSearchQuery(response.data.display_name);
      setMapKey((prev) => prev + 1);

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
            placeholder="Buscar dirección..."
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
              : defaultCenter
          }
          zoom={13}
          style={{ height: "500px", width: "100%" }}
          whenCreated={(map) => {
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
            zoom={13}
          />
        </MapContainer>
      </div>
    </div>
  );
};
