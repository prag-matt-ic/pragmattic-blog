'use client'

import { useGSAP } from '@gsap/react'
import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import { extend, type ShaderMaterialProps, useFrame, useThree } from '@react-three/fiber'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useRef } from 'react'
import { ShaderMaterial, Vector2 } from 'three'

import rayMarchingFragment from './raybox.frag'
import vertexShader from './screen.vert'

type Uniforms = {
  uTime: number
  uAspect: number
  uPointer: Vector2
  uScrollProgress: number
}

const INITIAL_UNIFORMS: Uniforms = {
  uTime: 0,
  uAspect: 1,
  uPointer: new Vector2(),
  uScrollProgress: 0,
}

const RayMarchingShaderMaterial = shaderMaterial(INITIAL_UNIFORMS, vertexShader, rayMarchingFragment)

extend({ RayMarchingShaderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    rayMarchingShaderMaterial: ShaderMaterialProps & Uniforms
  }
}

const RayMarchingScreenQuadShader: FC = () => {
  const { viewport } = useThree()
  const shader = useRef<ShaderMaterial & Partial<Uniforms>>(null)

  const scrollProgress = useRef(0)
  const scrollLoopCount = useRef(0) // Ensures a smooth progress loop

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: ({ progress }) => {
        scrollProgress.current = progress
        if (progress === 1) {
          // Loop the scroll
          scrollProgress.current = 0
          scrollLoopCount.current += 1
          window.scrollTo(0, 0)
        }
      },
    })
  }, [])

  useFrame(({ clock, pointer }) => {
    if (!shader.current) return
    shader.current.uTime = clock.elapsedTime
    shader.current.uPointer = pointer
    shader.current.uScrollProgress = scrollProgress.current + scrollLoopCount.current
  })

  return (
    <ScreenQuad>
      <rayMarchingShaderMaterial
        key={RayMarchingShaderMaterial.key}
        ref={shader}
        // Uniforms
        uTime={0}
        uAspect={viewport.aspect}
        uPointer={new Vector2(0)}
        uScrollProgress={0}
      />
    </ScreenQuad>
  )
}

export default RayMarchingScreenQuadShader
