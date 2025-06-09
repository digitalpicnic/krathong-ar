import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import {
  callDeviceOrientationEventPermission,
  checkHTTPSProtocol,
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
      longitude: position.longitude
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
  const [manualRotate, setManualRotate] = useState<boolean>(true);

  // const locationHandler = (coords: GeolocationCoordinates) => {
  //   const { latitude, longitude } = coords;
  //   const resP = calcDegreeToPoint(latitude, longitude);
  //   console.log("resP", resP);
  // };

  // const calcDegreeToPoint = (latitude: number, longitude: number) => {
  //   // Qibla geolocation
  //   const point = {
  //     lat: 21.422487,
  //     lng: 39.826206
  //   };

  //   const phiK = (point.lat * Math.PI) / 180.0;
  //   const lambdaK = (point.lng * Math.PI) / 180.0;
  //   const phi = (latitude * Math.PI) / 180.0;
  //   const lambda = (longitude * Math.PI) / 180.0;
  //   const psi =
  //     (180.0 / Math.PI) *
  //     Math.atan2(
  //       Math.sin(lambdaK - lambda),
  //       Math.cos(phi) * Math.tan(phiK) -
  //         Math.sin(phi) * Math.cos(lambdaK - lambda)
  //     );
  //   return Math.round(psi);
  // };

  useEffect(() => {
    console.log(coords);
    if (coords) handelGetCoords(coords);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isGeolocationAvailable;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isGeolocationEnabled;
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  // useEffect(() => {
  //   navigator.geolocation.watchPosition(handelGetCoords, null, {
  //     enableHighAccuracy: true,
  //     maximumAge: 30000,
  //     timeout: 1000
  //   });
  //   return () => {
  //     window.removeEventListener("deviceorientation", deviceOrientationHandler);
  //     window.removeEventListener("deviceorientationabsolute", deviceOrientationHandler);
  //   };
  // }, []);

  useEffect(() => {
    setDiffCoords({
      latitude: geoCoords.latitude - oriCoords.latitude,
      longitude: geoCoords.longitude - oriCoords.longitude
    });
  }, [geoCoords]);

  const isIOS = () => {
    return (
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)
    );
  };

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
          manualRotate={manualRotate}
        />
      </div>
      <div className="absolute top-0 left-0 z-50 h-auto w-full">
        <div>Ori Latitude:{oriCoords?.latitude}</div>
        <div>Ori Longitude:{oriCoords?.longitude}</div>
        <div>Diff Latitude:{diffCoords?.latitude / 0.00005644}</div>
        <div>Diff Longitude:{diffCoords?.longitude / 0.00005644}</div>
        <div>Latitude:{geoCoords?.latitude}</div>
        <div>Longitude:{geoCoords?.longitude}</div>
        <div>Accuracy: {coords?.accuracy}</div>
        <div>X degree:{compass?.beta}</div>
        <div>Y degree:{compass?.alpha}</div>
        <div>Z degree:{compass?.gamma}</div>
        <button className="" onClick={getPermission}>
          Get Permission
        </button>
        <button onClick={() => setManualRotate(!manualRotate)}>
          {manualRotate ? "Manual" : "Compass"}
        </button>
      </div>
    </div>
  );
};

export default Compass;
