import { useEffect, useState } from "react";
// import { useGeolocated } from "react-geolocated";
import Area from "./Area";
import type { GpsCoord } from "../common/gps.i";
// import { folder, useControls } from "leva";
import { GpsProvider } from "../context/GpsContext";
const Compass = () => {
  const [geoCoords, setGeo] = useState<GeolocationCoordinates>();
  const [coords, setCoords] = useState<GeolocationCoordinates>();
  const [oriCoords, setOriCoords] = useState<GpsCoord>({ latitude: 0, longitude: 0, altitude: 0 });
  // const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
  //   positionOptions: {
  //     enableHighAccuracy: true,
  //     maximumAge: 100
  //   },
  //   userDecisionTimeout: 500,
  //   watchPosition: true
  // });

  useEffect(() => {
    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gePosSuccess, gePosError);
      } else {
        console.log("error");
      }
    }
    const interval = setInterval(() => {
      getLocation();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const gePosSuccess = (position: GeolocationPosition) => {
    if (position.coords) {
      setGeo(position.coords);
    }
  };
  const gePosError = (error: GeolocationPositionError) => {
    console.log(error);
  };

  const handelGetCoords = (position: GeolocationCoordinates) => {
    if (oriCoords.latitude == 0) {
      setOriCoords({
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude || 0
      });
    }
    setCoords(position);
  };

  useEffect(() => {
    if (geoCoords) handelGetCoords(geoCoords);
  }, [geoCoords]);

  return (
    <div className="h-screen w-screen">
      <GpsProvider
        origin={oriCoords}
        coords={coords}
        isGeolocationAvailable={true}
        isGeolocationEnabled={true}
      >
        <div className="absolute top-0 left-0 h-full w-full">
          <Area />
        </div>
      </GpsProvider>
    </div>
  );
};

export default Compass;
