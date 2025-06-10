// import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { GpsCoord, OrientationType } from "../common/gps.i";
import BoxObject from "./BoxObject";
import * as THREE from "three";
// import CameraFeed from "./CameraFeed";
import { folder, useControls } from "leva";
import { useEffect, useState } from "react";
import DeviceOrientationCamera from "./DeviceOrientationCamera";
import useDeviceOrientation from "../utils/useDeviceOrientation";
import { originPosition } from "../utils/utils";
interface IAreaProps {
  origin: GpsCoord;
}

const Area = (props: IAreaProps) => {
  //#region Orientation
  const { orientation, requestPermission, isPermissionGranted, isSupported } =
    useDeviceOrientation();

  useEffect(() => {
    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  const handleOrientationChange = () => {
    orientation.screenOrientation = window.orientation || 0;
  };
  //#endregion

  const [cameraOrientation, setOrientation] = useState<OrientationType>(orientation);

  const cameraControls = useControls("Camera Control", {
    transform: folder({
      position: {
        value: {
          x: 0,
          y: 0,
          z: 5
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
    })
  });

  if (!isSupported) {
    useControls("Camera Control", {
      transform: folder({
        rotation: {
          value: {
            x: 0,
            y: 90,
            z: 0
          },
          x: {
            step: 0.1,
            min: 0,
            max: 360
          },
          y: {
            step: 0.1,
            min: -180,
            max: 180
          },
          z: {
            step: 0.05,
            min: -90,
            max: 90
          },
          onChange: (value) => {
            const { x, y, z } = value;
            orientation.alpha = x;
            orientation.beta = y;
            orientation.gamma = z;
            orientation.screenOrientation = orientation.screenOrientation || 0;
            setOrientation({
              alpha: x,
              beta: y,
              gamma: z,
              screenOrientation: orientation.screenOrientation
            });
          }
        }
      })
    });
  }

  const [, set] = useControls(
    () => ({
      "Camera Control": folder({
        orientation: folder({
          alpha: {
            value: 0,
            disabled: true
          },
          beta: {
            value: 0,
            disabled: true
          },
          gamma: {
            value: 0,
            disabled: true
          },
          screenOrientation: {
            value: 0,
            disabled: true
          }
        })
      })
    }),
    []
  );

  useEffect(() => {
    if (isPermissionGranted && isSupported) {
      set({
        alpha: orientation.alpha || 0,
        beta: orientation.beta || 0,
        gamma: orientation.gamma || 0,
        screenOrientation: orientation.screenOrientation || 0
      });
    }
  }, [cameraControls.position, orientation]);

  useEffect(() => {
    if (!(isPermissionGranted && isSupported)) {
      set({
        alpha: cameraOrientation.alpha || 0,
        beta: cameraOrientation.beta || 0,
        gamma: cameraOrientation.gamma || 0,
        screenOrientation: cameraOrientation.screenOrientation || 0
      });
    }
  }, [cameraOrientation]);

  return (
    <>
      {!isPermissionGranted && isSupported && (
        <div className="absolute z-30 flex h-screen w-screen items-center justify-center">
          <div className="bg-dp-light-gray flex h-32 w-72 flex-col items-center justify-between rounded-lg py-5">
            <h2>Get Device Orientation Permission</h2>
            <button className="bg-white" onClick={requestPermission}>
              Get Permission
            </button>
          </div>
        </div>
      )}

      {/* <CameraFeed /> */}
      <Canvas>
        <ambientLight intensity={1} />
        <DeviceOrientationCamera
          orientation={orientation}
          isPermissionGranted={isPermissionGranted}
          isSupported={isSupported}
          position={cameraControls.position as THREE.Vector3}
        />
        <axesHelper />
        {/* <mesh position={[0, 0, -5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="white" />
        </mesh> */}
        <BoxObject
          name="player"
          cameraPosition={cameraControls.position as THREE.Vector3}
          position={originPosition(props.origin, props.origin)}
          color={"white"}
        />
        <BoxObject
          name="obj1"
          cameraPosition={cameraControls.position as THREE.Vector3}
          position={new THREE.Vector3(0, 0, 5)}
          color={"red"}
        />
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
