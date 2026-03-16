/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

/**
 * Custom hook that tracks the user's geolocation in real time
 * using the browser Geolocation API (watchPosition).
 *
 * @returns {{ latitude: number|null, longitude: number|null, loading: boolean, error: string|null }}
 */
const useLocation = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const onSuccess = (position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setLoading(false);
      setError(null);
    };

    const onError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      options
    );

    // Cleanup: stop watching on unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { latitude, longitude, loading, error };
};

export default useLocation;