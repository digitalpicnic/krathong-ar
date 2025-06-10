import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrientationType } from "../common/gps.i";

export default function DeviceOrientationCamera() {
  const { camera } = useThree();
  const cameraRef = useRef(camera);
  const [permission, setPermission] = useState(false);
  const [orientation, setOrientation] = useState<OrientationType>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    screenOrientation: 0
  });

  useEffect(() => {
    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        window.addEventListener("deviceorientation", handleOrientation, true);
        window.addEventListener("orientationchange", handleOrientationChange);
        setPermission(true);
      }
    } else {
      // Android หรือเก่ากว่า
      window.addEventListener("deviceorientation", handleOrientation, true);
      window.addEventListener("orientationchange", handleOrientationChange);
      setPermission(true);
    }
  };

  const handleOrientationChange = () => {
    orientation.screenOrientation = window.orientation || 0;
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const { alpha = 0, beta = 0, gamma = 0 } = event;
    setOrientation({ alpha: alpha || 0, beta: beta || 0, gamma: gamma || 0 });
  };

  const setObjectQuaternion = (
    quaternion: THREE.Quaternion,
    alpha: number,
    beta: number,
    gamma: number,
    orient: number
  ) => {
    // Constant variable setup
    const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90° X axis

    // Calculate Quaternion
    euler.set(beta, alpha, -gamma, "YXZ"); // beta, alpha, gamma from device, reorder
    quaternion.setFromEuler(euler);
    quaternion.multiply(q1); // Apply -90 deg rotation on X (world alignment)
    quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // Rotate with screen orientation
  };

  useFrame(() => {
    if (!permission || !cameraRef.current) return;

    const { alpha, beta, gamma, screenOrientation } = orientation;

    const alphaRad = THREE.MathUtils.degToRad(alpha);
    const betaRad = THREE.MathUtils.degToRad(beta);
    const gammaRad = THREE.MathUtils.degToRad(gamma);
    const orientRad = THREE.MathUtils.degToRad(screenOrientation || 0);

    const quaternion = new THREE.Quaternion();
    setObjectQuaternion(quaternion, alphaRad, betaRad, gammaRad, orientRad);

    cameraRef.current.quaternion.copy(quaternion);
  });

  return null;
}
