"use client";
import { useGSAP } from "@gsap/react";
import { ScreenQuad, shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import React, { type FC, type RefObject, useRef } from "react";
import { Color, ShaderMaterial, Texture } from "three";

import { BLACK_VEC3_RGB, LIGHT_VEC3_RGB } from "@/resources/colours";

// Create custom shader.d.ts file for .vert and .frag files
import fragmentShader from "./backdropPlane.frag";
import vertexShader from "./backdropPlane.vert";
import textureImg from "./texture.jpg";

// Ensure packages are installed: "npm install @react-three/drei @react-three/fiber three raw-loader glslify-loader glslify glsl-noise"
// Setup Next.js config for handling glsl files

type Uniforms = {
  uTime: number;
  uAspectRatio: number;
  uScrollOffset: number;
  uLightColour: Color;
  uDarkColour: Color;
  uTexture: Texture | null;
};

const INITIAL_UNIFORMS: Uniforms = {
  uTime: 0,
  uAspectRatio: 1,
  uScrollOffset: 0,
  uLightColour: LIGHT_VEC3_RGB,
  uDarkColour: BLACK_VEC3_RGB,
  uTexture: null,
};

const BackdropPlaneShader = shaderMaterial(
  INITIAL_UNIFORMS,
  vertexShader,
  fragmentShader
);

extend({ BackdropPlaneShader });

const BackdropPlane: FC = () => {
  const texture = useTexture(textureImg.src);
  const { viewport } = useThree();
  const shader = useRef<SM>(null);
  const scrollOffset = useRef(0);

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: ({ progress }) => {
        scrollOffset.current = progress;
      },
    });
  }, []);

  useFrame(({ clock }) => {
    if (!shader.current) return;
    shader.current.uTime = clock.elapsedTime;
    shader.current.uScrollOffset = scrollOffset.current;
  });

  return (
    <ScreenQuad>
      <backdropPlaneShader
        key={BackdropPlaneShader.key}
        ref={shader}
        {...INITIAL_UNIFORMS}
        uAspectRatio={viewport.aspect}
        uTexture={texture}
      />
    </ScreenQuad>
  );
};
export default BackdropPlane;

type SM = Partial<ShaderMaterial> &
  Uniforms & { ref: RefObject<SM | null>; key: string };

declare module "@react-three/fiber" {
  interface ThreeElements {
    backdropPlaneShader: SM;
  }
}
