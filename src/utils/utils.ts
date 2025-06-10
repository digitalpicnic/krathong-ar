import * as THREE from "three";
import type { GpsCoord } from "../common/gps.i";

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

export const callDeviceOrientationEventPermission = async (): Promise<boolean> => {
  if (isIOS()) {
    const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventIOS)
      .requestPermission;
    const iOS = typeof requestPermission === "function";
    if (iOS) {
      try {
        const response = await requestPermission();
        if (response === "granted") {
          // execute
          return true;
        }
      } catch (e) {
        alert("not supported");
        console.log(e);

        return false;
      }
    }
    return false;
  }
  return true;
};

export const gpsToXY = (refLat: number, refLon: number, targetLat: number, targetLon: number) => {
  const R = 6378137; // รัศมีโลก (เมตร)
  const dLat = THREE.MathUtils.degToRad(targetLat - refLat);
  const dLon = THREE.MathUtils.degToRad(targetLon - refLon);
  // const latAvg = THREE.MathUtils.degToRad((refLat + targetLat) / 2);
  const dOri = THREE.MathUtils.degToRad(refLat);

  const x = R * dLon * Math.cos(dOri); // ตะวันออก
  const z = R * dLat; // เหนือ
  return [x, -z]; // ใน Three.js z ไปทางลึก เราใช้ -z เพื่อให้ทิศทางถูกต้อง
};

export const deg2rad = (degree: number, invert: boolean = false): number => {
  if (invert) {
    degree = 360 - degree;
  }
  return (Math.PI / 360) * degree;
};

export const originPosition = (origin: GpsCoord, position: GpsCoord): THREE.Vector3 => {
  const [x, z] = gpsToXY(origin.latitude, origin.longitude, position.latitude, position.longitude);
  const newPosition = new THREE.Vector3(x / 10, position.altitude, z / 10);
  return newPosition;
};

export function getCameraQuaternion(
  alpha: number,
  beta: number,
  gamma: number,
  screenOrientation: number
) {
  const degToRad = Math.PI / 180;

  const euler = new THREE.Euler();
  const finalQuaternion = new THREE.Quaternion();
  const screenTransform = new THREE.Quaternion();
  const worldTransform = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // rotate -90° around X

  // Convert to radians
  const alphaRad = alpha * degToRad;
  const betaRad = beta * degToRad;
  const gammaRad = gamma * degToRad;
  const orientRad = screenOrientation * degToRad;

  // Construct device orientation quaternion
  euler.set(betaRad, alphaRad, -gammaRad, "YXZ");
  finalQuaternion.setFromEuler(euler);

  // Apply world transform
  finalQuaternion.multiply(worldTransform);

  // Apply screen orientation
  screenTransform.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orientRad);
  finalQuaternion.multiply(screenTransform);

  return finalQuaternion;
}
