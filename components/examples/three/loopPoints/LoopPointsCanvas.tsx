"use client";
import { OrbitControls, PerformanceMonitor, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { type FC, useRef, useState } from "react";
import { Mesh } from "three";

import Button from "@/components/Button";

import LoopModel from "./loopModel/LoopModel";
import LoopPoints from "./LoopPoints";

const LoopPointsCanvas: FC = () => {
  const loopMesh = useRef<Mesh>(null);
  const [isScattered, setIsScattered] = useState(true);

  return (
    <main className="h-lvh w-full font-sans">
      <Canvas
        flat={true}
        camera={{ position: [0, 0, 3], fov: 70, far: 8, near: 0.01 }}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
      >
        <PerformanceMonitor>
          <LoopModel ref={loopMesh} />
          <LoopPoints mesh={loopMesh} isScattered={isScattered} />
        </PerformanceMonitor>
        <OrbitControls
          autoRotate={true}
          autoRotateSpeed={4}
          enableZoom={false}
        />
        {process.env.NODE_ENV === "development" && <Stats />}
      </Canvas>

      <section className="absolute bottom-16 z-50 flex w-full justify-center">
        <Button
          variant="filled"
          size="large"
          onClick={() => setIsScattered((prev) => !prev)}
        >
          {isScattered ? "Gather" : "Scatter"}
        </Button>
      </section>
    </main>
  );
};

export default LoopPointsCanvas;
