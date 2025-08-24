"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Box, Cone } from "@react-three/drei"
import type * as THREE from "three"

interface AncientExplorerProps {
  position?: [number, number, number]
}

export function AncientExplorer({ position = [0, 0, 0] }: AncientExplorerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const capeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1
    }

    if (capeRef.current) {
      capeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <Box args={[0.6, 1.2, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#6b4f3a" />
      </Box>

      {/* Head */}
      <Sphere args={[0.35]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#d7d2cb" />
      </Sphere>

      {/* Hat */}
      <Cone args={[0.4, 0.6]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color="#3e2723" />
      </Cone>

      {/* Cape */}
      <Box ref={capeRef} args={[0.8, 1.0, 0.1]} position={[0, 0, -0.3]}>
        <meshStandardMaterial color="#ffb74d" transparent opacity={0.8} />
      </Box>

      {/* Arms */}
      <Box args={[0.2, 0.8, 0.2]} position={[-0.5, 0.2, 0]}>
        <meshStandardMaterial color="#d7d2cb" />
      </Box>
      <Box args={[0.2, 0.8, 0.2]} position={[0.5, 0.2, 0]}>
        <meshStandardMaterial color="#d7d2cb" />
      </Box>

      {/* Legs */}
      <Box args={[0.2, 0.8, 0.2]} position={[-0.2, -1.0, 0]}>
        <meshStandardMaterial color="#3e2723" />
      </Box>
      <Box args={[0.2, 0.8, 0.2]} position={[0.2, -1.0, 0]}>
        <meshStandardMaterial color="#3e2723" />
      </Box>

      {/* Staff */}
      <Box args={[0.05, 2.0, 0.05]} position={[0.8, 0.5, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>

      {/* Staff Crystal */}
      <Sphere args={[0.15]} position={[0.8, 1.5, 0]}>
        <meshStandardMaterial color="#ffb74d" emissive="#ffb74d" emissiveIntensity={0.3} />
      </Sphere>
    </group>
  )
}
