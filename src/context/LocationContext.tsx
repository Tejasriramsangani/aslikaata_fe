"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationData {
  areaName: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress: string;
}

interface LocationContextType {
  location: LocationData;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  setLocation: (newLoc: Partial<LocationData>) => void;
  requestCurrentLocation: () => Promise<boolean>;
}

const DEFAULT_LOCATION: LocationData = {
  areaName: "Satyanarayanapuram",
  city: "Vijayawada",
  pincode: "520011",
  formattedAddress: "Satyanarayanapuram, Vijayawada, AP",
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationData>(DEFAULT_LOCATION);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aslikaata_customer_location');
      if (saved) {
        setLocationState(JSON.parse(saved));
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const setLocation = (newLoc: Partial<LocationData>) => {
    const updated = { ...location, ...newLoc };
    localStorage.setItem('aslikaata_customer_location', JSON.stringify(updated));
    setLocationState(updated);
  };

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  const requestCurrentLocation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            areaName: "Current Locality",
            city: "Vijayawada",
            pincode: "520011",
            latitude,
            longitude,
            formattedAddress: `GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          });
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isSheetOpen,
        openSheet,
        closeSheet,
        setLocation,
        requestCurrentLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
