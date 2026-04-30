import React, { useRef } from "react"
import { Canvas, useLoader, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Earth() {
  const texture = useLoader(
    THREE.TextureLoader,
    "https://unpkg.com/three-globe/example/img/earth-day.jpg"
  )

  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0015
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

export default function GlobeBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0b1a12] to-[#0f1a12]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,200,160,0.12),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.05),transparent_50%)]" />

      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
        }}
        camera={{ position: [0, 0, 6] }}
      >

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={2} />
        <directionalLight position={[-3, -2, -5]} intensity={0.4} />

        <Earth />

      </Canvas>
    </div>
  )
}