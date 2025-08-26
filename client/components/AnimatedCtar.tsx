import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import { useState } from 'react';

export function AnimatedCharacter() {
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
    <primitive object={gltf.scene} scale={1.5} position={[0, -1, 0]} />
  );
}