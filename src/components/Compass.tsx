import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import {
  callDeviceOrientationEventPermission,
  checkHTTPSProtocol,
  isIOS,
  type DeviceOrientationEventIOS
} from "../utils/utils";
import Area from "./Area";
import type { GpsCoord, OrientationType } from "../common/gps.i";
const Compass = () => {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true
    },
    userDecisionTimeout: 500,
    watchPosition: true
  });

  const [geoCoords, setGeoCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0 });

  const [oriCoords, setOriCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0 });
  const [diffCoords, setDiffCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0 });

  const handelGetCoords = (position: GeolocationCoordinates) => {
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

  const getPermission = async () => {
    console.log("click");

    if (checkHTTPSProtocol()) {
      const result = await callDeviceOrientationEventPermission();

      if (result) {
        const checkIos = isIOS();
        if (checkIos) {
          // IOS 13+
          window.addEventListener("deviceorientation", deviceOrientationHandler, true);
        } else {
          // Android or IOS < 13
          window.addEventListener("deviceorientationabsolute", deviceOrientationHandler, true);
        }
      } else {
        alert("has to be allowed!");
      }
    } else {
      alert("DeviceMotionEvent is not defined");
    }
  };

  const [compass, setCompass] = useState<OrientationType>({ alpha: 0, beta: 0, gamma: 0 });
  // const [manualRotate, setManualRotate] = useState<boolean>(false);

  useEffect(() => {
    console.log(coords);
    if (coords) handelGetCoords(coords);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isGeolocationAvailable;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isGeolocationEnabled;
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  useEffect(() => {
    setDiffCoords({
      latitude: geoCoords.latitude - oriCoords.latitude,
      longitude: geoCoords.longitude - oriCoords.longitude
    });
  }, [geoCoords]);

  const deviceOrientationHandler = (e: DeviceOrientationEventIOS | DeviceOrientationEvent) => {
    if (e != null) {
      const compass: OrientationType = {
        alpha: 0,
        beta: 0,
        gamma: 0
      };
      if (isIOS()) {
        if ((e as DeviceOrientationEventIOS).webkitCompassHeading) {
          compass.alpha = (e as DeviceOrientationEventIOS).webkitCompassHeading;
          compass.beta = e.beta || 0;
          compass.gamma = e.gamma || 0;
        }
      } else {
        if (e.alpha) {
          compass.alpha = Math.abs(e.alpha - 360);
          compass.beta = e.beta || 0;
          compass.gamma = e.gamma || 0;
        }
      }
      setCompass(compass);
    }
  };

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-0 left-0 h-full w-full">
        <Area
          origin={{ latitude: geoCoords?.latitude || 0, longitude: geoCoords?.longitude || 0 }}
          compass={compass}
          manualRotate={false}
        />
      </div>
      <div className="absolute top-0 left-0 z-50 h-auto w-full">
        <div>Diff Latitude:{diffCoords?.latitude * 17717.04722222}</div>
        <div>Diff Longitude:{diffCoords?.longitude * 17717.04722222}</div>
        <div>Latitude:{geoCoords?.latitude}</div>
        <div>Longitude:{geoCoords?.longitude}</div>
        <div>Altitude:{geoCoords?.altitude}</div>
        <div>Accuracy: {coords?.accuracy}</div>
        <div>X degree:{compass?.beta.toFixed(2)}</div>
        <div>Y degree:{compass?.alpha.toFixed(2)}</div>
        <div>Z degree:{compass?.gamma.toFixed(2)}</div>
        <button className="" onClick={getPermission}>
          Get Permission
        </button>
        {/* <button onClick={() => setManualRotate(!manualRotate)}>
          {manualRotate ? "Manual" : "Compass"}
        </button> */}
      </div>
    </div>
  );
};

export default Compass;
