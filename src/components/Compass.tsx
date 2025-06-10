import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import Area from "./Area";
import type { GpsCoord } from "../common/gps.i";
import { folder, useControls } from "leva";
const Compass = () => {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true
    },
    userDecisionTimeout: 500,
    watchPosition: true
  });

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
            value: "",
            disabled: true
          },
          longitude: {
            value: "",
            disabled: true
          },
          altitude: {
            value: "",
            disabled: true
          },
          accuracy: {
            value: "",
            min: 0,
            max: 100,
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
              value: "0",
              disabled: true
            },
            moveLong: {
              value: "0",
              disabled: true
            },
            moveAl: {
              value: "0",
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

  const [geoCoords, setGeoCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0 });
  const [oriCoords, setOriCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0 });
  const [diffCoords, setDiffCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0 });

  const handelGetCoords = (position: GeolocationCoordinates) => {
    setGPS({
      geolocationAvailable: isGeolocationAvailable,
      geolocationEnabled: isGeolocationEnabled,
      latitude: position.latitude.toPrecision(),
      longitude: position.longitude.toPrecision(),
      altitude: position?.altitude?.toPrecision() || "0",
      accuracy: position.accuracy.toPrecision()
    });
    setGeoCoords({
      latitude: position.latitude,
      longitude: position.longitude,
      altitude: position.altitude || 0
    });
    if (oriCoords.latitude == 0) {
      setOriCoords({
        latitude: position.latitude,
        longitude: position.longitude
      });
    }
  };

  useEffect(() => {
    if (coords) handelGetCoords(coords);
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  useEffect(() => {
    let altitude = 0;
    if (geoCoords.altitude && oriCoords.altitude) {
      altitude = geoCoords?.altitude - oriCoords?.altitude;
    }
    setDiffCoords({
      latitude: geoCoords.latitude - oriCoords.latitude,
      longitude: geoCoords.longitude - oriCoords.longitude,
      altitude: altitude
    });
  }, [geoCoords]);

  useEffect(() => {
    console.log(diffCoords);

    setPlayerGPS({
      moveLat: diffCoords.latitude.toPrecision(),
      moveLong: diffCoords.longitude.toPrecision(),
      moveAl: diffCoords.altitude?.toPrecision() || "0",
      x: diffCoords.latitude * 1110000.132,
      z: diffCoords.longitude * 1110000.32 * Math.cos((oriCoords.latitude * Math.PI) / 180)
    });
  }, [diffCoords]);

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-0 left-0 h-full w-full">
        <Area origin={geoCoords} />
      </div>
      {/* <div className="absolute top-0 left-0 z-10 h-auto w-full">
        <div>Diff Latitude:{diffCoords?.latitude * 17717.04722222}</div>
        <div>Diff Longitude:{diffCoords?.longitude * 17717.04722222}</div>
        <div>Latitude:{geoCoords?.latitude}</div>
        <div>Longitude:{geoCoords?.longitude}</div>
        <div>Altitude:{geoCoords?.altitude}</div>
        <div>Accuracy: {coords?.accuracy}</div>
      </div> */}
    </div>
  );
};

export default Compass;
