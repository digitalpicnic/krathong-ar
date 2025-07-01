import { createContext, useContext, useEffect, useState } from "react";
import type { ChildrenProp } from "../common/utils.i";
import { folder, useControls } from "leva";
import type { GpsCoord } from "../common/gps.i";

interface GpsProviderProps extends ChildrenProp, IProp {}

interface GpsContextProps extends IProp {
  playerPosition: { x: number; z: number };
}

interface IProp {
  origin: GpsCoord;
  coords: GeolocationCoordinates | undefined;
  isGeolocationAvailable: boolean;
  isGeolocationEnabled: boolean;
}

const GpsContext = createContext<GpsContextProps | undefined>(undefined);

export const GpsProvider: React.FC<GpsProviderProps> = ({
  children,
  origin,
  coords,
  isGeolocationAvailable,
  isGeolocationEnabled
}) => {
  const [, setGPS] = useControls(
    () => ({
      GPS: folder({
        device: folder({
          geolocationAvailable: {
            value: false,
            disabled: true
          },
          geolocationEnabled: {
            value: false,
            disabled: true
          },
          latitude: {
            value: 0,
            disabled: true
            // hint: "This value multiply 10000x"
          },
          longitude: {
            value: 0,
            disabled: true
            // hint: "This value multiply 10000x"
          },
          altitude: {
            value: 0,
            disabled: true
            // hint: "This value multiply 10000x"
          },
          accuracy: {
            value: 0,
            disabled: true
          }
        })
      })
    }),
    []
  );

  const [, setPlayerGPS] = useControls(
    () => ({
      GPS: folder({
        player: folder({
          coords: folder({
            moveLat: {
              value: 0,
              disabled: true
            },
            moveLong: {
              value: 0,
              disabled: true
            },
            moveAl: {
              value: 0,
              disabled: true
            }
          }),
          position: folder({
            x: {
              value: 0,
              disabled: true
            },
            z: {
              value: 0,
              disabled: true
            }
          })
        })
      })
    }),
    []
  );

  const [,] = useControls(
    () => ({
      GPS: folder({
        debug: folder({
          latitude: {
            value: 0,
            step: 0.001,
            onChange: (value) => {
              const newGeo: GpsCoord = {
                latitude: debugGeo.latitude + value,
                longitude: debugGeo.longitude,
                altitude: debugGeo.altitude
              };
              setDebugGeo(newGeo);
            }
          },
          longitude: {
            value: 0,
            step: 0.001,
            onChange: (value) => {
              const newGeo: GpsCoord = {
                latitude: debugGeo.latitude,
                longitude: debugGeo.longitude + value,
                altitude: debugGeo.altitude
              };
              setDebugGeo(newGeo);
            }
          },
          altitude: {
            value: 0,
            step: 0.001,
            onChange: (value) => {
              const newGeo: GpsCoord = {
                latitude: debugGeo.latitude,
                longitude: debugGeo.longitude,
                altitude: debugGeo.altitude + value
              };
              setDebugGeo(newGeo);
            }
          }
        })
      })
    }),
    []
  );

  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0 });
  const [debugGeo, setDebugGeo] = useState<GpsCoord>({ latitude: 0, longitude: 0, altitude: 0 });

  useEffect(() => {
    const position = {
      latitude: 0,
      longitude: 0,
      altitude: 0,
      accuracy: 0
    };
    if (coords) {
      position.latitude = coords.latitude;
      position.longitude = coords.longitude;
      position.altitude = coords.altitude || 0;
      position.accuracy = coords.accuracy;
    }
    setGPS({
      geolocationAvailable: isGeolocationAvailable,
      geolocationEnabled: isGeolocationEnabled,
      latitude: position.latitude * 10000,
      longitude: position.longitude * 10000,
      altitude: position.altitude * 10000,
      accuracy: position.accuracy
    });

    const diff = {
      latitude: origin.latitude - position.latitude + debugGeo.latitude,
      longitude: origin.longitude - position.longitude + debugGeo.longitude,
      altitude: origin.altitude ? origin.altitude - position.altitude : 0
    };

    setPlayerGPS({
      moveLat: diff.latitude * 10000,
      moveLong: diff.longitude * 10000,
      moveAl: diff.altitude * 10000,
      x: diff.latitude * 111.132,
      z: diff.longitude * 111.32 * Math.cos((origin.latitude * Math.PI) / 180)
    });
    setPlayerPosition({
      x: diff.latitude * 111.132,
      z: diff.longitude * 111.32 * Math.cos((origin.latitude * Math.PI) / 180)
    });
  }, [coords, debugGeo]);

  useEffect(() => {}, [playerPosition]);

  const calculateDiff = (): GpsCoord => {
    const position = {
      latitude: origin.latitude,
      longitude: origin.longitude
    };
    if (coords) {
      position.latitude -= coords.latitude + debugGeo.latitude;
      position.longitude -= coords.longitude + debugGeo.longitude;
    }
    return position;
  };

  return (
    <GpsContext
      value={{ origin, coords, isGeolocationAvailable, isGeolocationEnabled, playerPosition }}
    >
      <div className="absolute top-0 z-50 flex h-auto w-screen justify-start space-x-2 bg-gray-400 p-5">
        <div className="flex-col">
          <div>Origin</div>
          <div>Lat: {origin?.latitude}</div>
          <div>Long: {origin?.longitude}</div>
          <div>Alt: {origin?.altitude}</div>
        </div>
        <div className="flex-col">
          <div>Device</div>
          <div>Lat: {coords?.latitude}</div>
          <div>Long: {coords?.longitude}</div>
          <div>Alt: {coords?.altitude}</div>
        </div>
        <div className="flex-col">
          <div>Player</div>
          <div>Lat: {calculateDiff().latitude}</div>
          <div>Long: {calculateDiff().longitude}</div>
          <div>Alt: {}</div>
        </div>
      </div>
      {children}
    </GpsContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useGpsContext(): GpsContextProps {
  const context = useContext(GpsContext);
  if (!context) {
    throw new Error("coord must be used within a GpsProvider");
  }
  return context;
}
