import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import {
  getCurrentLocation,
  updateLocation,
  checkLocationPermissions,
  requestLocationPermissions,
  LocationData,
} from '@/services/locationService';

interface UseLocationTrackingOptions {
  enabled?: boolean;
  updateInterval?: number; // in milliseconds, default 30000 (30 seconds)
  sendToBackend?: boolean; // whether to send location to backend
  accuracy?: Location.Accuracy;
}

interface UseLocationTrackingReturn {
  location: LocationData | null;
  error: string | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

export const useLocationTracking = (
  options: UseLocationTrackingOptions = {}
): UseLocationTrackingReturn => {
  const {
    enabled = true,
    updateInterval = 30000, // 30 seconds default
    sendToBackend = true,
    accuracy = Location.Accuracy.Balanced,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Function to get and update location
  const updateCurrentLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        setError(null);

        // Send to backend if enabled
        if (sendToBackend) {
          try {
            await updateLocation(currentLocation);
          } catch (backendError) {
            // Don't fail the whole location tracking if backend update fails
            console.warn('Failed to send location to backend:', backendError);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      console.error('Location tracking error:', err);
    }
  };

  // Start location tracking
  const startTracking = async () => {
    try {
      // Check permissions
      let hasPermission = await checkLocationPermissions();
      if (!hasPermission) {
        hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
          setError('Location permission not granted');
          return;
        }
      }

      setIsTracking(true);
      setError(null);

      // Get initial location
      await updateCurrentLocation();

      // Watch for location updates
      watchSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: updateInterval,
          distanceInterval: 10, // Update if moved 10 meters
        },
        (newLocation) => {
          const locationData: LocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            altitude: newLocation.coords.altitude,
            altitudeAccuracy: newLocation.coords.altitudeAccuracy,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            timestamp: newLocation.timestamp,
          };

          setLocation(locationData);
          setError(null);

          // Send to backend if enabled
          if (sendToBackend) {
            updateLocation(locationData).catch((err) => {
              console.warn('Failed to send location to backend:', err);
            });
          }
        }
      );

      // Also set up interval as backup
      intervalRef.current = setInterval(() => {
        updateCurrentLocation();
      }, updateInterval);
    } catch (err: any) {
      setError(err.message || 'Failed to start location tracking');
      setIsTracking(false);
      console.error('Error starting location tracking:', err);
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  };

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        enabled &&
        isTracking
      ) {
        // App came to foreground, refresh location
        updateCurrentLocation();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, isTracking]);

  // Auto-start tracking when enabled
  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking();
    } else if (!enabled && isTracking) {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, [enabled]);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
};

