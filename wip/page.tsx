"use client";
import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Leva } from "leva";
import React, { type FC, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute } from "three";

export default function PlayPage() {
  return (
    <main className="min-h-lvh w-full">
      <Canvas
        className="!fixed inset-0"
        gl={{
          alpha: false,
          antialias: false,
          depth: false,
          // powerPreference: 'high-performance',
        }}
      >
        <BasicLinesPoints />
        <OrbitControls />
        <Stats />
      </Canvas>

      {/* Controls */}
      <Leva titleBar={{ position: { x: -8, y: 64 } }} />
    </main>
  );
}

// 1. Simple Approach updating the points and line segments each frame on the CPU.

const BasicLinesPoints: FC = () => {
  const NUMBER_OF_POINTS = 200;
  const SIZE = 6;

  // Refs for both the points and the line geometry attributes.
  const pointPositions = useRef<BufferAttribute>(null);
  const linePositions = useRef<BufferAttribute>(null);

  // Generate the initial random positions for the points.
  const intialPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < NUMBER_OF_POINTS; i++) {
      const x = Math.random() * SIZE - SIZE / 2;
      const y = Math.random() * SIZE - SIZE / 2;
      const z = Math.random() * SIZE - SIZE / 2;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  // Create an initial line vertices array.
  // Each segment connects two consecutive points: (point i to point i+1)
  const initialLineVertices = useMemo(() => {
    // There are (NUMBER_OF_POINTS - 1) segments and each segment needs 2 vertices (6 floats).
    return new Float32Array((NUMBER_OF_POINTS - 1) * 6);
  }, []);

  // Update both points and line geometry each frame.
  useFrame(() => {
    if (!pointPositions.current || !linePositions.current) return;

    const pointsArray = pointPositions.current.array as Float32Array;

    // Update points: move each point upward in the y-axis.
    for (let i = 1; i < pointsArray.length; i += 3) {
      pointsArray[i] += 0.003;
      if (pointsArray[i] >= SIZE / 2) {
        pointsArray[i] = -SIZE / 2;
        pointsArray[i + 1] = Math.random() * SIZE - SIZE / 2;
      }
    }
    pointPositions.current.needsUpdate = true;

    // Update line segments so they follow the points.
    // For each segment, update with the current and next point.
    const lineArray = linePositions.current.array as Float32Array;
    for (let i = 0; i < NUMBER_OF_POINTS - 1; i++) {
      const currentIndex = i * 3;
      const nextIndex = (i + 1) * 3;

      // Current point for this segment.
      lineArray[i * 6 + 0] = pointsArray[currentIndex];
      lineArray[i * 6 + 1] = pointsArray[currentIndex + 1];
      lineArray[i * 6 + 2] = pointsArray[currentIndex + 2];

      // Next point for this segment.
      lineArray[i * 6 + 3] = pointsArray[nextIndex];
      lineArray[i * 6 + 4] = pointsArray[nextIndex + 1];
      lineArray[i * 6 + 5] = pointsArray[nextIndex + 2];
    }
    linePositions.current.needsUpdate = true;
  });

  return (
    <>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            ref={pointPositions}
            attach="attributes-position"
            array={intialPositions}
            count={intialPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="white" sizeAttenuation={true} />
      </points>
      <lineSegments>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            ref={linePositions}
            attach="attributes-position"
            array={initialLineVertices}
            count={initialLineVertices.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="white"
          opacity={0.3}
          blending={AdditiveBlending}
          transparent={true}
        />
      </lineSegments>
    </>
  );
};

// 2. Advanced Approach - managing the point and vertices positions using a simulation shader

const AdvancedLinesPoints: FC = () => {
  const NUMBER_OF_POINTS = 200;
  const SIZE = 6;

  // Refs for both the points and the line geometry attributes.
  const pointPositions = useRef<BufferAttribute>(null);
  const linePositions = useRef<BufferAttribute>(null);

  // Generate the initial random positions for the points.
  const intialPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < NUMBER_OF_POINTS; i++) {
      const x = Math.random() * SIZE - SIZE / 2;
      const y = Math.random() * SIZE - SIZE / 2;
      const z = Math.random() * SIZE - SIZE / 2;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  // Create an initial line vertices array.
  // Each segment connects two consecutive points: (point i to point i+1)
  const initialLineVertices = useMemo(() => {
    // There are (NUMBER_OF_POINTS - 1) segments and each segment needs 2 vertices (6 floats).
    return new Float32Array((NUMBER_OF_POINTS - 1) * 6);
  }, []);

  // Update both points and line geometry each frame.
  useFrame(() => {
    if (!pointPositions.current || !linePositions.current) return;

    const pointsArray = pointPositions.current.array as Float32Array;

    // Update points: move each point upward in the y-axis.
    for (let i = 1; i < pointsArray.length; i += 3) {
      pointsArray[i] += 0.003;
      if (pointsArray[i] >= SIZE / 2) {
        pointsArray[i] = -SIZE / 2;
        pointsArray[i + 1] = Math.random() * SIZE - SIZE / 2;
      }
    }
    pointPositions.current.needsUpdate = true;

    // Update line segments so they follow the points.
    // For each segment, update with the current and next point.
    const lineArray = linePositions.current.array as Float32Array;
    for (let i = 0; i < NUMBER_OF_POINTS - 1; i++) {
      const currentIndex = i * 3;
      const nextIndex = (i + 1) * 3;

      // Current point for this segment.
      lineArray[i * 6 + 0] = pointsArray[currentIndex];
      lineArray[i * 6 + 1] = pointsArray[currentIndex + 1];
      lineArray[i * 6 + 2] = pointsArray[currentIndex + 2];

      // Next point for this segment.
      lineArray[i * 6 + 3] = pointsArray[nextIndex];
      lineArray[i * 6 + 4] = pointsArray[nextIndex + 1];
      lineArray[i * 6 + 5] = pointsArray[nextIndex + 2];
    }
    linePositions.current.needsUpdate = true;
  });

  return (
    <>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            ref={pointPositions}
            attach="attributes-position"
            array={intialPositions}
            count={intialPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="white" sizeAttenuation={true} />
      </points>
      <lineSegments>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            ref={linePositions}
            attach="attributes-position"
            array={initialLineVertices}
            count={initialLineVertices.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="white"
          opacity={0.3}
          blending={AdditiveBlending}
          transparent={true}
        />
      </lineSegments>
    </>
  );
};
