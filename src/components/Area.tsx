// import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { GpsCoord, OrientationType } from "../common/gps.i";
import BoxObject from "./BoxObject";
import * as THREE from "three";
// import CameraFeed from "./CameraFeed";
import { useControls } from "leva";
import CustomCamera from "./CustomCamera";
import { useEffect } from "react";
import DeviceOrientationCamera from "./DeviceOrientationCamera";
interface IAreaProps {
  origin: GpsCoord;
  compass: OrientationType;
  manualRotate: boolean;
}

const Area = (props: IAreaProps) => {
  const { cameraPosition } = useControls({
    cameraPosition: {
      value: {
        x: 0,
        y: 0,
        z: 0
      },
      x: {
        step: 0.1,
        min: -10,
        max: 10
      },
      y: {
        step: 0.1,
        min: -10,
        max: 10
      },
      z: {
        step: 0.1,
        min: -10,
        max: 10
      }
    }
  });

  useEffect(() => {}, [cameraPosition]);
  return (
    <>
      {/* <CameraFeed /> */}
      <Canvas>
        <ambientLight intensity={1} />
        {/* <CustomCamera
          cameraPosition={cameraPosition as THREE.Vector3}
          manualRotate={props.manualRotate}
          compass={props.compass}
        /> */}
        <DeviceOrientationCamera />
        <axesHelper />
        {/* <mesh position={[0, 0, -5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh> */}
        {/* <BoxObject
          name="player"
          cameraPosition={cameraPosition as THREE.Vector3}
          origin={props.origin}
          position={props.origin}
          color={"white"}
        /> */}
        {/* <BoxObject
          name="obj1"
          cameraPosition={cameraPosition as THREE.Vector3}
          position={new THREE.Vector3(0, 0, 5)}
          color={"red"}
        /> */}
        <mesh position={[0, -0.5, 0]}>
          <planeGeometry args={[5, 0.1, 5]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <directionalLight position={[1, 1, 1]} color="white" />
        {/* <OrbitControls /> */}
      </Canvas>
    </>
  );
};

export default Area;
