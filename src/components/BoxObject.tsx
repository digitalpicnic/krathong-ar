import * as THREE from "three";
import { gpsToXY } from "../utils/utils";
import type { GpsCoord } from "../common/gps.i";
import { Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
interface IBoxObjectProps {
  name: string;
  cameraPosition: THREE.Vector3;
  position: GpsCoord; // lat lon
  origin: GpsCoord; // lat lon
  color: string | THREE.Color;
}

const BoxObject = (props: IBoxObjectProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const updatePosition = (): THREE.Vector3 => {
    const originPos = originPosition();
    const newPosition = new THREE.Vector3(
      originPos.x - props.cameraPosition.x,
      originPos.y - props.cameraPosition.y,
      originPos.z - props.cameraPosition.z
    );
    return newPosition;
  };

  const originPosition = (): THREE.Vector3 => {
    const [x, z] = gpsToXY(
      props.origin.latitude,
      props.origin.longitude,
      props.position.latitude,
      props.position.longitude
    );
    const newPosition = new THREE.Vector3(x, 0, z);
    return newPosition;
  };

  useEffect(() => {
    console.log(props.origin);
    setPosition(updatePosition());
  }, [props.origin, props.cameraPosition]);

  const boxHeader = () => {
    return `${props.name}\nx:${position.x}\ny:${position.y}\nz:${position.z}`;
  };

  useFrame(() => {
    setPosition(updatePosition());
    if (groupRef.current) {
      groupRef.current.position.set(position.x, position.y, position.z);
    }
    if (textRef.current) {
      textRef.current.lookAt(
        props.cameraPosition.x,
        props.cameraPosition.y,
        props.cameraPosition.z
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={props.color} />
      </mesh>
      <Text
        ref={textRef}
        position={[0, 1.5, 0]} // slightly above the box
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {boxHeader()}
      </Text>
    </group>
  );
};

export default BoxObject;
