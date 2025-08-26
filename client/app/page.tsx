"use client"
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { 
  OrbitControls, 
  Environment, 
  Float,
  Stars,
} from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Trophy, Coins, Rocket, Satellite as LucideSatellite, Globe, Star, Zap, Shield } from 'lucide-react';
import Link from 'next/link'; // Import Link for redirection


function AnimatedCharacter2() {
  const [error, setError] = useState(false);
  // Using a more detailed robot model that works well with the space theme.
  const gltf = useLoader(GLTFLoader, 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb', (loader) => {
    loader.manager.onError = () => setError(true);
  });

  if (error) {
    console.error('Failed to load 3D model.');
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  // Adjusting scale and position for the new model
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <primitive object={gltf.scene} scale={4} position={[0, -2.5, 0]} />
    </Float>
  );
}

// Animated Character Component from user's code
function AnimatedCharacter() {
  const [error, setError] = useState(false);
  const gltf = useLoader(GLTFLoader, 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', (loader) => {
    loader.manager.onError = () => setError(true);
  });

  if (error) {
    console.error('Failed to load 3D model.');
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <primitive object={gltf.scene} scale={2.5} position={[0, -1, 0]} />
    </Float>
  );
}

// Planet with image texture
function Planet({ position, imageUrl, size = 1, speed = 0.5 }) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      setTexture(loadedTexture);
    });
  }, [imageUrl]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={texture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
    </Float>
  );
}

// Satellite with modern design
function Satellite({ position, scrollProgress }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] - scrollProgress * 8;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef} position={position}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial 
            color="#E8E8E8" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#00BFFF"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Glowing rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#FF6B9D" transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Scene
// 3D Scene
function SpaceScene({ scrollProgress }) {
  return (
    <>
      <Environment preset="dawn" />
      <Stars radius={200} depth={50} count={15000} factor={4} saturation={0} fade />
      
      {/* Lighting for a more even, professional look */}
      <ambientLight intensity={0.8} /> {/* Increased ambient light */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.0} 
        color="#FFF8DC"
      />
      {/* Added hemisphere light to illuminate the dark side of the planets */}
      <hemisphereLight args={['#ffffff', '#111122', 0.8]} /> 
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#87CEEB" />
      
      {/* Animated Astronaut Character */}
      <group position={[-8, -5, 5]} scale={2}>
        <AnimatedCharacter />
      </group>

      {/* Earth Model */}
      <Planet 
        position={[0, -25, -20]} 
        imageUrl="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1024&h=1024&fit=crop&crop=center"
        size={10}
        speed={0.1}
      />

      <group position={[8, -5, -5]} scale={0.4}>
        <AnimatedCharacter2 />
      </group>
      
      {/* Other Planets */}
      <Planet 
        position={[8, 2, -10]} 
        imageUrl="https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=512&h=512&fit=crop&crop=center"
        size={3}
        speed={0.2}
      />
      <Planet 
        position={[15, -8, -15]} 
        imageUrl="https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=512&h=512&fit=crop&crop=center"
        size={2.5}
        speed={0.4}
      />
      
      {/* Satellite */}
      <Satellite position={[0, -12, 8]} scrollProgress={scrollProgress} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}
// Animated background particles
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, gradient, delay = 0 }) {
  return (
    <Card className={`bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group animate-float`} 
          style={{ animationDelay: `${delay}s` }}>
      <CardContent className="p-8 text-center">
        <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <Icon className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// Stat Card Component
function StatCard({ value, label, gradient }) {
  return (
    <div className="text-center group cursor-pointer">
      <div className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
        {value}
      </div>
      <div className="text-gray-600 text-lg tracking-wide">{label}</div>
    </div>
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <Rocket className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-500" />
        </div>
        <p className="text-blue-600 text-lg font-semibold">Launching Space Systems...</p>
      </div>
    </div>
  );
}

// Main Landing Page Component
export default function WandryFiLanding() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrolled / maxScroll);
    };

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800 overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .game-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
        }
      `}</style>

      {/* Particle Background */}
      <ParticleField />

      {/* Hero Section with 3D Scene */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 5, 20], fov: 75 }}>
            <Suspense fallback={null}>
              <SpaceScene scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-8">
            {/* Left side - Astronaut space */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left mb-10 md:mb-0">
              <div className="opacity-80">
                <p className="text-lg text-blue-600 mb-2">🚀 Space Exploration Protocol</p>
                <p className="text-sm text-gray-500">Next-Gen Staking Adventure</p>
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="w-full md:w-1/2 text-center md:text-right">
              <div className="space-y-8">
                <div>
                  <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 leading-tight">
                    WANDRYFI
                  </h1>
                  <p className="text-2xl md:text-3xl text-gray-700 font-light tracking-wider mb-6">
                    EXPLORE • STAKE • PROSPER
                  </p>
                  <div className="flex gap-4 justify-center md:justify-end mt-4">
                    <Link href="/explore">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                        EXPLORE
                      </Button>
                    </Link>
                    <Link href="/stake">
                      <Button variant="outline" className="border-2 border-blue-400 text-blue-600 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-xl bg-white/50 backdrop-blur-sm">
                        STAKE
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <p className="text-xl text-gray-600 max-w-md mx-auto md:ml-auto md:mr-0 leading-relaxed mb-8">
                  Embark on the ultimate space adventure where your stakes fuel interstellar exploration and cosmic rewards await.
                </p>
                

              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-1 h-16 bg-gradient-to-b from-blue-400 to-transparent rounded-full"></div>
            <p className="text-sm text-gray-500">Scroll to explore</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-8 bg-gradient-to-br from-white/50 to-blue-50/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              GAME MECHANICS
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Master these core systems to become the ultimate space explorer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={Coins}
              title="DEPLOY ASSETS"
              description="Stake ETH on mysterious cosmic destinations. Higher stakes unlock exclusive sectors and multiplier rewards in unexplored galaxies."
              gradient="from-yellow-400 to-orange-500"
              delay={0.2}
            />
            
            <FeatureCard
              icon={Zap}
              title="NAVIGATE COSMOS"
              description="Use advanced quantum navigation to chart courses through asteroid fields, nebulae, and black hole territories."
              gradient="from-purple-400 to-pink-500"
              delay={0.4}
            />
            
            <FeatureCard
              icon={Trophy}
              title="CLAIM REWARDS"
              description="Successfully reach destinations to unlock planetary treasures. Failed expeditions contribute to the community exploration fund."
              gradient="from-green-400 to-emerald-500"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-8 bg-gradient-to-r from-blue-100/50 to-purple-100/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatCard
              value="2,847"
              label="SPACE EXPLORERS"
              gradient="from-blue-500 to-cyan-400"
            />
            <StatCard
              value="12,456"
              label="ETH STAKED"
              gradient="from-green-500 to-emerald-400"
            />
            <StatCard
              value="847"
              label="WORLDS DISCOVERED"
              gradient="from-purple-500 to-pink-400"
            />
            <StatCard
              value="96%"
              label="SUCCESS RATE"
              gradient="from-orange-500 to-red-400"
            />
          </div>
        </div>
      </section>

      {/* Achievement System Preview */}
      <section className="py-32 px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              ACHIEVEMENT SYSTEM
            </h2>
            <p className="text-xl text-gray-600">Unlock legendary status through cosmic exploration</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "Stellar Navigator", desc: "Complete 10 successful missions", color: "from-yellow-400 to-orange-400" },
              { icon: Shield, title: "Void Walker", desc: "Survive 5 black hole encounters", color: "from-purple-400 to-indigo-400" },
              { icon: Globe, title: "Planet Collector", desc: "Discover 25 unique worlds", color: "from-green-400 to-cyan-400" }
            ].map((achievement, index) => (
              <div key={index} className="game-card p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center`}>
                  <achievement.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop')] opacity-20 bg-cover bg-center"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-6xl md:text-7xl font-black mb-8">
            READY TO EXPLORE?
          </h2>
          <p className="text-2xl mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
            Join thousands of explorers in the greatest space adventure ever created. Your cosmic journey starts now.
          </p>
          <Button className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-5 rounded-2xl text-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-white/20">
            <Globe className="mr-4" size={28} />
            BEGIN EXPLORATION
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Rocket className="h-10 w-10 text-blue-400" />
            <span className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              WANDRYFI
            </span>
          </div>
          <p className="text-xl text-gray-300 tracking-wide mb-8">
            EXPLORE THE COSMOS • STAKE YOUR FUTURE • EARN LEGENDARY STATUS
          </p>
          <div className="flex justify-center space-x-8 text-gray-400">
            <span>© 2024 WandryFi</span>
            <span>•</span>
            <span>Space Exploration Protocol</span>
            <span>•</span>
            <span>Built for Adventurers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}