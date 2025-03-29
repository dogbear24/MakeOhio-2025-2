import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/ThemedText';

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      setError(null);
      return location;
    } catch (err) {
      setError('Error fetching location');
      console.error('Location error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { location, error, isLoading, getLocation };
};

export const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
  
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  };

export const LocationDisplay = () => {
  const { location, error, isLoading } = useLocation();

  return (
    <>
      {isLoading && <ThemedText>Getting location...</ThemedText>}
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      {location && (
        <ThemedText>
          GPS: {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
        </ThemedText>
      )}
    </>
  );
};