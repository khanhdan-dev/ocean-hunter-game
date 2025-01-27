'use client';
import React, { Ref, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  Euler,
  ExtendedColors,
  Layers,
  Matrix4,
  NodeProps,
  NonFunctionKeys,
  Overwrite,
  Quaternion,
  useFrame,
  Vector3,
} from '@react-three/fiber';
import {
  BufferGeometry,
  Group,
  Object3DEventMap,
  NormalBufferAttributes,
} from 'three';
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events';

export function Model(
  props: React.JSX.IntrinsicAttributes &
    Omit<
      ExtendedColors<
        Overwrite<
          Partial<Group<Object3DEventMap>>,
          NodeProps<Group<Object3DEventMap>, typeof Group>
        >
      >,
      NonFunctionKeys<{
        position?: Vector3;
        up?: Vector3;
        scale?: Vector3;
        rotation?: Euler;
        matrix?: Matrix4;
        quaternion?: Quaternion;
        layers?: Layers;
        dispose?: (() => void) | null;
      }>
    > & {
      position?: Vector3;
      up?: Vector3;
      scale?: Vector3;
      rotation?: Euler;
      matrix?: Matrix4;
      quaternion?: Quaternion;
      layers?: Layers;
      dispose?: (() => void) | null;
    } & EventHandlers,
) {
  const { nodes, materials } = useGLTF('/models/skin-4.glb');
  const modelRef = useRef<Group<Object3DEventMap>>();

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.position.y =
        -2.8 + Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });
  return (
    <group
      {...props}
      ref={modelRef as Ref<Group<Object3DEventMap>>}
      position={[0, 0, 0]}
      scale={[3, 3, 3]}
      rotation={[0, 0, 0]}
      dispose={null}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={
          (
            nodes.model as unknown as {
              geometry: BufferGeometry<NormalBufferAttributes>;
            }
          ).geometry
        }
        material={materials.CustomMaterial}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload('/models/skin-4.glb');
