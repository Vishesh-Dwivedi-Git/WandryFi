"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useTexture, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// --- CONSTANTS & LOCATIONS ---
const GLOBE_RADIUS = 2.5;
const CLOUDS_RADIUS = 2.53; // Slightly larger
const ATMOSPHERE_RADIUS = 2.75; // Glow layer

const LOCATIONS = [
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093 },
    { name: "Dubai", lat: 25.2048, lon: 55.2708 },
    { name: "Singapore", lat: 1.3521, lon: 103.8198 },
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "Berlin", lat: 52.5200, lon: 13.4050 },
    { name: "Moscow", lat: 55.7558, lon: 37.6173 },
    { name: "Beijing", lat: 39.9042, lon: 116.4074 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
    { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "Toronto", lat: 43.65107, lon: -79.347015 },
    { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
    { name: "Lagos", lat: 6.5244, lon: 3.3792 },
    { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
    { name: "Seoul", lat: 37.5665, lon: 126.9780 },
];

/**
 * Calculates 3D position on a sphere from Lat/Lon
 */
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}

// --- SHADERS ---

// Atmosphere Vertex Shader (Fresnel Effect)
const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Atmosphere Fragment Shader (Fresnel Effect)
const atmosphereFragmentShader = `
varying vec3 vNormal;
void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
    // Premium Cyan/Blue mix
    gl_FragColor = vec4(0.2, 0.8, 1.0, 1.0) * intensity * 2.0;
}
`;

// --- COMPONENTS ---

interface LocationMarkerProps {
    position: THREE.Vector3;
    name: string;
    isHovered: boolean;
    onHover: (name: string | null) => void;
}

function LocationMarker({ position, name, isHovered, onHover }: LocationMarkerProps) {
    return (
        <group position={position}>
            {/* Interactive Hit Area (Invisible but larger) */}
            <mesh
                visible={false}
                onPointerEnter={(e) => { e.stopPropagation(); onHover(name); }}
                onPointerLeave={(e) => { e.stopPropagation(); onHover(null); }}
            >
                <sphereGeometry args={[0.2, 16, 16]} />
            </mesh>

            {/* Visual Marker */}
            <mesh>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={isHovered ? "#00ffff" : "#ffffff"} />
            </mesh>

            {/* Pulse Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.06, 0.08, 32]} />
                <meshBasicMaterial
                    color={isHovered ? "#00ffff" : "#ffffff"}
                    transparent
                    opacity={isHovered ? 0.8 : 0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer Glow Ring for Hover */}
            {isHovered && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.09, 0.12, 32]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Tooltip */}
            {isHovered && (
                <Html
                    position={[0, 0.2, 0]}
                    center
                    style={{ pointerEvents: "none", userSelect: "none" }}
                    zIndexRange={[100, 0]}
                >
                    <div className="backdrop-blur-md bg-black/60 border border-white/10 px-4 py-2 rounded-sm shadow-[0_0_15px_rgba(0,255,255,0.3)] transform transition-transform duration-200 scale-100">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-cyan-300 font-mono tracking-[0.2em] uppercase leading-none">Location</span>
                            <span className="text-sm text-white font-bold tracking-widest mt-1">{name.toUpperCase()}</span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const [paused, setPaused] = useState(false);
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

    // Load High-Res Textures
    const [colorMap, bumpMap, specularMap, cloudsMap] = useTexture([
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
        "https://unpkg.com/three-globe/example/img/earth-topology.png",
        "https://unpkg.com/three-globe/example/img/earth-water.png",
        "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png",
    ]);

    // Pre-calculate positions
    const markers = useMemo(() => {
        return LOCATIONS.map(loc => ({
            ...loc,
            pos: latLonToVector3(loc.lat, loc.lon, GLOBE_RADIUS)
        }));
    }, []);

    useFrame((state, delta) => {
        // Smooth rotation
        // If paused or hovered, slow down to a crawl or stop?
        // Let's keep a tiny drift even when "paused" for liveness, but very slow.
        const speed = (paused || hoveredLocation) ? 0.02 : 0.1;

        if (earthRef.current) {
            earthRef.current.rotation.y += delta * speed;
        }
        if (cloudsRef.current) {
            // Clouds rotate slightly faster/independently
            cloudsRef.current.rotation.y += delta * (speed * 1.2);
        }
    });

    return (
        <group>
            {/* --- EARTH SUFACE --- */}
            <mesh
                ref={earthRef}
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
            >
                <sphereGeometry args={[GLOBE_RADIUS, 256, 256]} />
                <meshPhongMaterial
                    map={colorMap}
                    bumpMap={bumpMap}
                    bumpScale={0.15} // Increased bump for more depth
                    specularMap={specularMap}
                    specular={new THREE.Color("#444444")} // Darker grey for realistic ocean reflection
                    shininess={15}
                />

                {/* Markers are children of Earth so they stick to surface */}
                {markers.map((loc, i) => (
                    <LocationMarker
                        key={i}
                        position={loc.pos}
                        name={loc.name}
                        isHovered={hoveredLocation === loc.name}
                        onHover={setHoveredLocation}
                    />
                ))}
            </mesh>

            {/* --- CLOUDS LAYER --- */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[CLOUDS_RADIUS, 256, 256]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false} // Prevents clouds from occluding markers weirdly
                />
            </mesh>

            {/* --- ATMOSPHERE GLOW (Fresnel) --- */}
            <mesh>
                <sphereGeometry args={[ATMOSPHERE_RADIUS, 128, 128]} />
                <shaderMaterial
                    vertexShader={atmosphereVertexShader}
                    fragmentShader={atmosphereFragmentShader}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    transparent
                />
            </mesh>

            {/* --- LIGHTING (Dark Mode / Space) --- */}
            <ambientLight intensity={0.1} /> {/* Slightly brighter ambient to show texture details */}
            <directionalLight position={[5, 3, 5]} intensity={4.0} color={"#f0f8ff"} /> {/* Cool white sun */}
            {/* Strong Rim light for dramatic edge - Cyan/Magenta Tint */}
            <spotLight position={[-5, 2, -2]} intensity={5.0} color="#00ffff" angle={0.6} penumbra={0.5} />
            <spotLight position={[0, -5, 0]} intensity={1.0} color="#aa00ff" angle={0.5} penumbra={1} /> {/* Subtle under-glow */}
        </group>
    );
}

export default function GlobeShaderComponent() {
    return (
        <div className="w-full h-full relative group">
            {/* Canvas Container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Canvas
                    camera={{ position: [0, 0, 7], fov: 45 }}
                    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
                    dpr={[1, 2]} // Support high-DPI screens
                >
                    <Earth />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 1.5}
                        rotateSpeed={0.5}
                    />
                </Canvas>
            </div>

            {/* Decorative UI Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em] shadow-black drop-shadow-md">
                    Intervention Active
                </span>
            </div>
        </div>
    );
}
