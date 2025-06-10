import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { OrientationType } from "../common/gps.i";
import { mobileAndTabletCheck } from "../utils/useDeviceOrientation";

interface IDeviceOrientationCameraProps {
  orientation: OrientationType;
  isPermissionGranted: boolean;
  isSupported: boolean;
  position: THREE.Vector3;
}

const DeviceOrientationCamera = (props: IDeviceOrientationCameraProps) => {
  const { camera } = useThree();
  const cameraRef = useRef(camera);

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
    updatePosition();
    updateRotation();
  });

  const updateRotation = () => {
    const { isSupported, isPermissionGranted, orientation } = props;
    if (mobileAndTabletCheck())
      if (!isSupported || !isPermissionGranted || !cameraRef.current) return;

    const { alpha, beta, gamma, screenOrientation } = orientation;

    const alphaRad = THREE.MathUtils.degToRad(alpha);
    const betaRad = THREE.MathUtils.degToRad(beta);
    const gammaRad = THREE.MathUtils.degToRad(gamma);
    const orientRad = THREE.MathUtils.degToRad(screenOrientation || 0);

    const quaternion = new THREE.Quaternion();
    setObjectQuaternion(quaternion, alphaRad, betaRad, gammaRad, orientRad);

    cameraRef.current.quaternion.copy(quaternion);
  };

  const updatePosition = () => {
    if (cameraRef.current) {
      cameraRef.current.position.copy(props.position);
    }
  };

  return null;
};

export default DeviceOrientationCamera;
