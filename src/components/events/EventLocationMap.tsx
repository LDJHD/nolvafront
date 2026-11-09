"use client";
import { useEffect, useState } from "react";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  canEdit?: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

const EventLocationMap = ({ latitude, longitude, locationName, canEdit, onLocationUpdate }: Props) => {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [lat, setLat] = useState<number | null>(latitude ?? null);
  const [lng, setLng] = useState<number | null>(longitude ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLat(latitude ?? null);
    setLng(longitude ?? null);
  }, [latitude, longitude]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGettingLocation(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        onLocationUpdate?.(newLat, newLng);
        setGettingLocation(false);
      },
      (err) => {
        setError("Impossible d'obtenir votre position. Vérifiez les permissions.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const mapUrl = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : null;

  return (
    <div className="nolva-event-location">
      <h5 className="mb-2">
        <i className="fi fi-rr-marker me-2"></i> Localisation exacte
      </h5>

      {canEdit && (
        <button
          type="button"
          className="nolva-btn-primary mb-3"
          onClick={getLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? "Localisation en cours..." : lat && lng ? "Modifier ma localisation" : "Ma localisation exacte"}
        </button>
      )}

      {error && <p className="text-danger small">{error}</p>}

      {mapUrl ? (
        <div>
          <iframe
            title="Carte de l'événement"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: 12 }}
            src={mapUrl}
          ></iframe>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nolva-btn-secondary mt-2 d-inline-block"
            >
              <i className="fi fi-rr-route"></i> Itinéraire / Se guider
            </a>
          )}
        </div>
      ) : (
        <p className="text-muted small">
          {canEdit
            ? "Cliquez sur le bouton ci-dessus pour ajouter votre localisation exacte."
            : "La localisation exacte n'a pas encore été ajoutée par l'organisateur."}
        </p>
      )}
    </div>
  );
};

export default EventLocationMap;
