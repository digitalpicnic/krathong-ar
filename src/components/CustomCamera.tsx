import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrientationType } from "../common/gps.i";
import { useEffect, useRef, useState } from "react";

interface ICustomCamera {
  cameraPosition: THREE.Vector3;
  cameraRotation: THREE.Vector3;
  compass: OrientationType;
  manualRotate: boolean;
}

const CustomCamera = (props: ICustomCamera) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const set = useThree((state) => state.set);

  const [position, setPosition] = useState<THREE.Vector3>(props.cameraPosition);
  const [rotation, setRotation] = useState<THREE.Quaternion>(new THREE.Quaternion());

  const updateCameraRotation = (orientation: OrientationType) => {
    const alpha = orientation.alpha ?? 0; // z-axis (compass)
    // const beta = orientation.beta ?? 0; // x-axis (tilt front-back)
    // const gamma = orientation.gamma ?? 0; // y-axis (tilt left-right)

    // Convert to radians
    const _alpha = THREE.MathUtils.degToRad(360 - alpha);
    // const _beta = THREE.MathUtils.degToRad(beta);
    // const _gamma = THREE.MathUtils.degToRad(gamma);

    // Construct Euler and Quaternion
    const euler = new THREE.Euler(0, _alpha, 0, "XYZ");
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    setRotation(quaternion);
    // Apply rotation to the camera
    // if (!props.manualRotate) {
    //   camera.quaternion.copy(quaternion);
    //   props.cameraRotation.x = camera.rotation.x;
    //   props.cameraRotation.y = camera.rotation.y;
    //   props.cameraRotation.z = camera.rotation.z;
    // } else camera.rotation.set(props.cameraRotation.x, props.cameraRotation.y, props.cameraRotation.z);
  };

  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  useEffect(() => {
    updateCameraRotation(props.compass);
    setPosition(props.cameraPosition);
  }, [props]);

  useFrame(() => {
    updatePosition();
    updateRotation();
  });

  const updateRotation = () => {
    // Apply rotation to the camera
    if (cameraRef.current) {
      cameraRef.current.quaternion.copy(rotation);
      if (!props.manualRotate) {
        props.cameraRotation.x = cameraRef.current.rotation.x;
        props.cameraRotation.y = cameraRef.current.rotation.y;
        props.cameraRotation.z = cameraRef.current.rotation.z;
      } else
        cameraRef.current.rotation.set(
          props.cameraRotation.x,
          props.cameraRotation.y,
          props.cameraRotation.z
        );
    }
  };

  const updatePosition = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(position.x, position.y, position.z);
    }
  };
  return <perspectiveCamera ref={cameraRef} fov={60} near={0.001} far={1000} />;
};

export default CustomCamera;
