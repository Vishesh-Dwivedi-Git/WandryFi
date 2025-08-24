"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Float,
  Sphere,
  MeshDistortMaterial,
  Stars,
  Text,
  Sparkles,
  Trail,
} from "@react-three/drei"
import { Suspense, useRef, useState, useMemo } from "react"
import type * as THREE from "three"

function SophisticatedTraveler() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [time, setTime] = useState(0)

  useFrame((state) => {
    setTime(state.clock.elapsedTime)
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.2
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.3 + Math.cos(time * 1.2) * 0.1
      groupRef.current.position.x = Math.sin(time * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.1 : 1}>
          {/* Head with helmet */}
          <group position={[0, 2.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshPhysicalMaterial
                color={hovered ? "#06b6d4" : "#8b5cf6"}
                metalness={0.8}
                roughness={0.2}
                clearcoat={1}
                clearcoatRoughness={0.1}
                emissive={hovered ? "#06b6d4" : "#8b5cf6"}
                emissiveIntensity={0.1}
              />
            </mesh>

            {/* Visor */}
            <mesh position={[0, 0, 0.4]} rotation={[0.1, 0, 0]}>
              <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshPhysicalMaterial
                color="#00ff88"
                metalness={1}
                roughness={0}
                transmission={0.9}
                thickness={0.1}
                emissive="#00ff88"
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Antenna */}
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} />
            </mesh>
          </group>

          {/* Torso with tech details */}
          <group position={[0, 1, 0]}>
            <mesh>
              <cylinderGeometry args={[0.4, 0.5, 1.2, 8]} />
              <meshPhysicalMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} clearcoat={1} />
            </mesh>

            {/* Chest reactor */}
            <mesh position={[0, 0.3, 0.45]}>
              <cylinderGeometry args={[0.12, 0.12, 0.1]} />
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={0.8 + Math.sin(time * 3) * 0.2}
              />
            </mesh>

            {/* Side panels */}
            <mesh position={[-0.35, 0, 0.3]} rotation={[0, -0.3, 0]}>
              <boxGeometry args={[0.15, 0.8, 0.05]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0.35, 0, 0.3]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.15, 0.8, 0.05]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.2} />
            </mesh>
          </group>

          {/* Arms with joints */}
          <group position={[-0.7, 1.3, 0]}>
            <mesh rotation={[0, 0, 0.4 + Math.sin(time * 2) * 0.1]}>
              <cylinderGeometry args={[0.12, 0.15, 1]} />
              <meshPhysicalMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <sphereGeometry args={[0.18]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} />
            </mesh>
          </group>

          <group position={[0.7, 1.3, 0]}>
            <mesh rotation={[0, 0, -0.4 - Math.sin(time * 2) * 0.1]}>
              <cylinderGeometry args={[0.12, 0.15, 1]} />
              <meshPhysicalMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <sphereGeometry args={[0.18]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} />
            </mesh>
          </group>

          {/* Legs with tech details */}
          <group position={[-0.25, 0.1, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.18, 1]} />
              <meshPhysicalMaterial color="#16213e" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <boxGeometry args={[0.3, 0.15, 0.4]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.2} />
            </mesh>
          </group>

          <group position={[0.25, 0.1, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.18, 1]} />
              <meshPhysicalMaterial color="#16213e" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <boxGeometry args={[0.3, 0.15, 0.4]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.2} />
            </mesh>
          </group>

          {/* Advanced backpack with thrusters */}
          <group position={[0, 1.2, -0.6]}>
            <mesh>
              <boxGeometry args={[0.5, 0.8, 0.3]} />
              <meshPhysicalMaterial color="#22d3ee" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Thruster effects */}
            <mesh position={[-0.15, -0.5, -0.2]}>
              <cylinderGeometry args={[0.05, 0.08, 0.2]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.8 + Math.sin(time * 5) * 0.3}
              />
            </mesh>
            <mesh position={[0.15, -0.5, -0.2]}>
              <cylinderGeometry args={[0.05, 0.08, 0.2]} />
              <meshStandardMaterial
                color="#ff6b35"
                emissive="#ff6b35"
                emissiveIntensity={0.8 + Math.sin(time * 5 + 1) * 0.3}
              />
            </mesh>
          </group>
        </group>
      </Float>

      <Trail width={0.1} length={20} color="#00ff88" attenuation={(t) => t * t}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
          <mesh position={[3, 2, 1]}>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5 + Math.sin(time * 3) * 0.2}
            />
          </mesh>
        </Float>
      </Trail>

      <Trail width={0.08} length={15} color="#a855f7" attenuation={(t) => t * t}>
        <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
          <mesh position={[-3, 1, 2]}>
            <tetrahedronGeometry args={[0.25]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.4 + Math.sin(time * 2.5 + 1) * 0.2}
            />
          </mesh>
        </Float>
      </Trail>

      <Sparkles count={50} scale={[8, 8, 8]} size={3} speed={0.5} color="#06b6d4" />
    </group>
  )
}

function AdvancedIndiaGlobe() {
  const globeRef = useRef<THREE.Mesh>(null)
  const pointsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  const indiaDestinations = useMemo(
    () => [
      { name: "Taj Mahal", pos: [0.8, 0.3, 0.5] },
      { name: "Kerala Backwaters", pos: [0.7, -0.6, 0.4] },
      { name: "Rajasthan Desert", pos: [0.5, 0.1, 0.8] },
      { name: "Himalayan Peaks", pos: [0.6, 0.8, 0.2] },
      { name: "Goa Beaches", pos: [0.4, -0.3, 0.8] },
      { name: "Mumbai Skyline", pos: [0.3, -0.1, 0.9] },
      { name: "Varanasi Ghats", pos: [0.9, 0.2, 0.3] },
      { name: "Bangalore Tech Hub", pos: [0.6, -0.4, 0.6] },
    ],
    [],
  )

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={[4, -1, -3]} scale={1.2}>
        <mesh ref={globeRef}>
          <Sphere args={[1.2, 64, 64]}>
            <MeshDistortMaterial
              color="#06b6d4"
              attach="material"
              distort={0.05}
              speed={1.5}
              roughness={0.1}
              metalness={0.9}
              emissive="#06b6d4"
              emissiveIntensity={0.15}
            />
          </Sphere>
        </mesh>

        <group ref={pointsRef}>
          {indiaDestinations.map((dest, i) => (
            <Float key={dest.name} speed={1 + i * 0.1} rotationIntensity={0.3} floatIntensity={0.3}>
              <mesh position={[dest.pos[0] * 1.3, dest.pos[1] * 1.3, dest.pos[2] * 1.3]}>
                <sphereGeometry args={[0.04]} />
                <meshStandardMaterial
                  color="#00ff88"
                  emissive="#00ff88"
                  emissiveIntensity={0.8 + Math.sin(Date.now() * 0.001 + i) * 0.3}
                />
              </mesh>
              <Text
                position={[dest.pos[0] * 1.5, dest.pos[1] * 1.5, dest.pos[2] * 1.5]}
                fontSize={0.08}
                color="#00ff88"
                anchorX="center"
                anchorY="middle"
              >
                {dest.name}
              </Text>
            </Float>
          ))}
        </group>
      </group>
    </Float>
  )
}

export function Enhanced3DCharacter() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 3, 10], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <Environment preset="night" />
          <Stars radius={400} depth={80} count={2000} factor={8} saturation={0} fade speed={0.8} />

          <ambientLight intensity={0.2} color="#8b5cf6" />
          <spotLight
            position={[15, 15, 15]}
            angle={0.2}
            penumbra={1}
            intensity={3}
            color="#06b6d4"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-15, -10, -15]} intensity={2} color="#00ff88" />
          <pointLight position={[10, -15, 10]} intensity={1.5} color="#a855f7" />

          <SophisticatedTraveler />
          <AdvancedIndiaGlobe />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
