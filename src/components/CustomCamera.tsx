import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrientationType } from "../common/gps.i";
import { useEffect, useRef, useState } from "react";
// import { getCameraQuaternion } from "../utils/utils";

interface ICustomCamera {
  cameraPosition: THREE.Vector3;
  compass: OrientationType;
  manualRotate: boolean;
}

const CustomCamera = (props: ICustomCamera) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const set = useThree((state) => state.set);

  const [position, setPosition] = useState<THREE.Vector3>(props.cameraPosition);
  // const [rotation, setRotation] = useState<THREE.Euler>(new THREE.Euler());
  const [quaternion, setQuaternion] = useState<THREE.Quaternion>(new THREE.Quaternion());

  // const updateCameraRotation = (orientation: OrientationType) => {
  //   // const alpha = orientation.alpha ?? 0; // z-axis (compass)
  //   // const beta = orientation.beta ?? 0; // x-axis (tilt front-back)
  //   // const gamma = orientation.gamma ?? 0; // y-axis (tilt left-right)

  //   // Convert to radians
  //   // const _alpha = THREE.MathUtils.degToRad(360 - alpha);
  //   // const _beta = THREE.MathUtils.degToRad(180 - beta);
  //   // const _gamma = THREE.MathUtils.degToRad(gamma);

  //   // Construct Euler and Quaternion
  //   // const euler = new THREE.Euler(_beta, _alpha, 0, "XYZ");
  //   // const quaternion = new THREE.Quaternion().setFromEuler(euler);

  //   const alpha = orientation.alpha ?? 0;
  //   const beta = orientation.beta ?? 0;
  //   const gamma = orientation.gamma ?? 0;

  //   const euler = new THREE.Euler(
  //     -THREE.MathUtils.degToRad(beta),
  //     THREE.MathUtils.degToRad(360 - alpha),
  //     -THREE.MathUtils.degToRad(gamma),
  //     "XYZ"
  //   );

  //   // camera.quaternion.setFromEuler(euler);

  //   setRotation(euler);
  // };

  const updateCameraRotation1 = (orientation: OrientationType) => {
    // const screenOrientation: number = 0;

    // const quaternion = getCameraQuaternion(
    //   orientation.alpha,
    //   orientation.beta,
    //   orientation.gamma,
    //   screenOrientation
    // );
    // setQuaternion(quaternion);

    // แปลงค่าจาก degrees เป็น radians
    const alphaRad = THREE.MathUtils.degToRad(orientation.alpha);
    const betaRad = THREE.MathUtils.degToRad(orientation.beta);
    const gammaRad = THREE.MathUtils.degToRad(orientation.gamma);

    // สร้าง quaternion จาก Euler
    const euler = new THREE.Euler(betaRad, alphaRad, gammaRad, "YXZ");
    const quaternion = new THREE.Quaternion().setFromEuler(euler);

    const deviceQuat = new THREE.Quaternion();
    const screenAdjust = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, -1, 0),
      -Math.PI / 2
    );

    deviceQuat.multiplyQuaternions(quaternion, screenAdjust);
    setQuaternion(deviceQuat);
  };

  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  useEffect(() => {
    updateCameraRotation1(props.compass);
    setPosition(props.cameraPosition);
  }, [props]);

  useFrame(() => {
    updatePosition();
    updateRotation();
  });

  const updateRotation = () => {
    // Apply rotation to the camera
    if (cameraRef.current) {
      // cameraRef.current.quaternion.setFromEuler(rotation, true);
      cameraRef.current.quaternion.copy(quaternion);

      // cameraRef.current.quaternion.copy(rotation);
      // if (props.manualRotate) {
      //   props.cameraRotation.x = cameraRef.current.rotation.x;
      //   props.cameraRotation.y = cameraRef.current.rotation.y;
      //   props.cameraRotation.z = cameraRef.current.rotation.z;
      // } else {
      //   cameraRef.current.quaternion.setFromEuler(rotation);
      //   // cameraRef.current.rotation.set(
      //   //   props.cameraRotation.x,
      //   //   props.cameraRotation.y,
      //   //   props.cameraRotation.z
      //   // );
      // }
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
