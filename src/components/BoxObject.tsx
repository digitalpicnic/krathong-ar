import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
interface IBoxObjectProps {
  name: string;
  cameraPosition: THREE.Vector3;
  position: THREE.Vector3;
  color: string | THREE.Color;
}

const BoxObject = (props: IBoxObjectProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const updatePosition = (): THREE.Vector3 => {
    const originPos = props.position;
    const newPosition = new THREE.Vector3(
      originPos.x - props.cameraPosition.x,
      originPos.y - props.cameraPosition.y,
      originPos.z - props.cameraPosition.z
    );
    return newPosition;
  };

  useEffect(() => {
    setPosition(updatePosition());
  }, [props.position, props.cameraPosition]);

  const boxHeader = () => {
    return `${props.name}\nx:${position.x.toFixed(2)}\ny:${position.y.toFixed(2)}\nz:${position.z.toFixed(2)}`;
  };

  useEffect(() => {}, [position]);

  useFrame(() => {
    setPosition(updatePosition());
    if (groupRef.current) {
      // groupRef.current.position.set(position.x, position.y, position.z);
      groupRef.current.position.lerp(position, 0.1);
    }
    if (textRef.current) {
      // console.log(position);
      textRef.current.lookAt(lookAtCamera());
      // console.log(props.cameraPosition);
    }
  });

  const lookAtCamera = (): THREE.Vector3 => {
    if (props.cameraPosition) {
      const dir = new THREE.Vector3().copy(props.cameraPosition);
      dir.sub(position);
      return dir.normalize();
    }
    return new THREE.Vector3();
  };

  return (
    <group ref={groupRef}>
      <axesHelper />
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
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
      <arrowHelper args={[lookAtCamera(), new THREE.Vector3(), 5, 0xff0000]} />
    </group>
  );
};

export default BoxObject;
