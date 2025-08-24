"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float, Environment } from "@react-three/drei"
import { motion, useScroll, useTransform } from "framer-motion"
import type * as THREE from "three"

// Floating 3D Sphere Component
function FloatingSphere({
  position,
  color,
  size = 1,
  distort = 0.1,
  speed = 1,
}: {
  position: [number, number, number]
  color: string
  size?: number
  distort?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.8) * 0.1
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[size, 128, 128]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={1.5}
          roughness={0.0}
          metalness={0.9}
          transparent
          opacity={0.9}
        />
      </Sphere>
    </Float>
  )
}

// 3D Scene Component
function CosmosScene() {
  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#8B5CF6" />

      <FloatingSphere position={[-4, 2, -2]} color="#6366F1" size={1.2} distort={0.05} />
      <FloatingSphere position={[4, -1, -3]} color="#8B5CF6" size={0.8} distort={0.08} />
      <FloatingSphere position={[-2, -2, -4]} color="#1E1B4B" size={1} distort={0.06} />
      <FloatingSphere position={[3, 3, -1]} color="#3B82F6" size={0.6} distort={0.1} />
      <FloatingSphere position={[-5, -1, -5]} color="#6B46C1" size={1.4} distort={0.04} />
      <FloatingSphere position={[2, -3, -2]} color="#4F46E5" size={0.9} distort={0.07} />
      <FloatingSphere position={[-1, 4, -6]} color="#7C3AED" size={1.1} distort={0.05} />
      <FloatingSphere position={[5, 1, -4]} color="#5B21B6" size={0.7} distort={0.09} />
    </>
  )
}

export default function CosmosHero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black animate-gradient-shift" />

      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <CosmosScene />
        </Canvas>
      </div>

      {/* Content */}
      <motion.div style={{ y: y1, opacity }} className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-tight"
        >
          Stake on the{" "}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
            Journey.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
        >
          Reduce risks, scale adventures, and make your travels come alive. Hundreds of explorers use our platform to
          stake on destinations, earn rewards, and discover incredible places across India.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
            Start Your Journey
          </button>
          <button className="px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-full hover:border-purple-400 hover:text-white transition-all duration-300">
            Explore Destinations
          </button>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div style={{ y: y2 }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </section>
  )
}
