"use client";

import { ScreenQuad, shaderMaterial } from "@react-three/drei";
import {
  createPortal,
  extend,
  type ShaderMaterialProps,
  useThree,
  Viewport,
} from "@react-three/fiber";
import React, { forwardRef, memo, type RefObject } from "react";
import {
  DataTexture,
  FloatType,
  Mesh,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector3,
} from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

import simulationFragment from "./simulation.frag";
import simulationVertex from "./simulation.vert";

export type SimulationUniforms = {
  uTime: number;
  uScatteredPositions: DataTexture | null;
  uLoopPositions: DataTexture | null;
  uScatteredAmount: number;
};

const INITIAL_SIMULATION_UNIFORMS: SimulationUniforms = {
  uTime: 0,
  uScatteredPositions: null,
  uLoopPositions: null,
  uScatteredAmount: 1,
};

const LoopPointsSimulationShaderMaterial = shaderMaterial(
  INITIAL_SIMULATION_UNIFORMS,
  simulationVertex,
  simulationFragment
);

extend({ LoopPointsSimulationShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    loopPointsSimulationShaderMaterial: ShaderMaterialProps &
      SimulationUniforms;
  }
}

type Props = {
  mesh: RefObject<Mesh>;
  particlesCount: number;
  fboScene: Scene;
};

type Ref = ShaderMaterial & Partial<SimulationUniforms>;

const LoopParticleSimulationMaterial = forwardRef<Ref, Props>(
  ({ mesh, particlesCount, fboScene }, ref) => {
    const viewport = useThree((s) => s.viewport);
    const textureSize = Math.sqrt(particlesCount);

    // Off-screen simulation material
    return (
      <>
        {createPortal(
          <ScreenQuad>
            {/* TODO: attach seed attribute and then use that to control random movement. */}
            <loopPointsSimulationShaderMaterial
              key={LoopPointsSimulationShaderMaterial.key}
              ref={ref}
              attach="material"
              {...INITIAL_SIMULATION_UNIFORMS}
              onBeforeCompile={(shader) => {
                if (!shader) return;
                if (!mesh.current) return;

                const scatteredPositions = createDataTextureFromPositions(
                  getScatteredPositions(particlesCount, viewport),
                  textureSize
                );

                const loopPositions = createDataTextureFromPositions(
                  getMeshSurfacePositions({
                    mesh: mesh.current,
                    count: particlesCount,
                  }),
                  textureSize
                );

                shader.uniforms.uScatteredPositions = {
                  value:
                    scatteredPositions as SimulationUniforms["uScatteredPositions"],
                };

                shader.uniforms.uLoopPositions = {
                  value: loopPositions as SimulationUniforms["uLoopPositions"],
                };
              }}
            />
          </ScreenQuad>,
          fboScene
        )}
      </>
    );
  }
);

LoopParticleSimulationMaterial.displayName = "LoopParticleSimulationMaterial";

const createDataTextureFromPositions = (
  positions: Float32Array,
  textureSize: number
): DataTexture => {
  const expectedLength = textureSize * textureSize * 4;
  if (positions.length !== expectedLength) {
    const padded = new Float32Array(expectedLength);
    padded.set(positions);
    positions = padded;
  }
  const dt = new DataTexture(
    positions,
    textureSize,
    textureSize,
    RGBAFormat,
    FloatType
  );
  dt.needsUpdate = true;
  return dt;
};

const getMeshSurfacePositions = ({
  mesh,
  count,
  scale,
  offset,
  extrude,
}: {
  mesh: Mesh;
  count: number;
  scale?: number;
  offset?: Vector3;
  extrude?: number;
}): Float32Array => {
  const positions = new Float32Array(count * 4);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const pos = new Vector3();
  const normal = new Vector3();

  for (let i = 0; i < count; i++) {
    sampler.sample(pos, normal);
    // Extrude the position along its normal
    if (!!extrude) pos.addScaledVector(normal, extrude);
    // Apply scaling and offset
    if (!!scale) pos.multiplyScalar(scale);
    if (!!offset) pos.add(offset);
    positions.set([pos.x, pos.y, pos.z, 1.0], i * 4);
  }

  return positions;
};

const getScatteredPositions = (
  count: number,
  viewport: Viewport
): Float32Array => {
  const positions = new Float32Array(count * 4);

  // spread across a box
  const width = viewport.width + 2;
  const height = viewport.height + 2;
  const depth = 5;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * width - width / 2;
    const y = Math.random() * height - height / 2;
    const z = Math.random() * depth - depth / 2;
    const a = 1.0;

    positions.set([x, y, z, a], i * 4);
  }

  return positions;
};

export default memo(LoopParticleSimulationMaterial);
