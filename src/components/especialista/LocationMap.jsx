import React from "react";
import styles from "./LocationMap.module.css";

const LocationMap = ({ point, address }) => {
  const coordinates = typeof point === "string" ? JSON.parse(point) : point;

  const mapUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`;

  return (
    <div className={styles.mapContainer}>
      <h4>Ubicación</h4>
      <p className={styles.address}>{address}</p>
      <div className={styles.mapWrapper}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen=""
          aria-hidden="false"
          tabIndex="0"
        />
      </div>
    </div>
  );
};

export default LocationMap;
