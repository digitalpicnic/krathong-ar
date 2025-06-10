import { useCallback, useEffect, useState } from "react";
import type { OrientationType } from "../common/gps.i";

export interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
  webkitCompassHeading: number;
  webkitCompassAccuracy: number;
}

export const isIOS = () => {
  return (
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)
  );
};

export const checkHTTPSProtocol = () => {
  console.log(location.protocol);

  if (location.protocol != "https:") {
    // location.href = "https:" + window.location.href.substring(window.location.protocol.length);
    return false;
  }
  return true;
};

function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<OrientationType>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    absolute: false
  });

  // Check if the DeviceOrientationEvent is supported - this will be true in most browsers (even desktop)
  const isSupported = typeof window.DeviceOrientationEvent !== "undefined";

  // Determine if we need to request permission (for iOS 13+)
  const [isPermissionGranted, setIsPermissionGranted] = useState(
    typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventIOS).requestPermission !==
      "function"
  );

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0,
      absolute: event.absolute
    });
  }, []);

  useEffect(() => {
    if (isPermissionGranted) {
      window.addEventListener("deviceorientation", handleOrientation);
      return () => {
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    }
  }, [isPermissionGranted, handleOrientation]);

  const requestPermission = useCallback(async () => {
    if (checkHTTPSProtocol()) {
      const deviceOrientationEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventIOS;

      if (typeof deviceOrientationEvent.requestPermission === "function") {
        try {
          const permissionState = await deviceOrientationEvent.requestPermission();
          setIsPermissionGranted(permissionState === "granted");
        } catch (error) {
          console.error("Error requesting device orientation permission:", error);
        }
      }
    }
  }, []);

  return { orientation, requestPermission, isPermissionGranted, isSupported };
}

export default useDeviceOrientation;
