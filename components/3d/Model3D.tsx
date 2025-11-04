"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'

interface Model3DProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  className?: string;
}

function Model({ modelPath, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: Omit<Model3DProps, 'autoRotate' | 'className'>) {
  const { scene } = useGLTF(modelPath)

  return (
    <primitive
      object={scene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  )
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

export function Model3D({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = true,
  className = "w-full h-[500px]"
}: Model3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="city" />

          {/* Model */}
          <Model
            modelPath={modelPath}
            scale={scale}
            position={position}
            rotation={rotation}
          />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload models
export function preloadModel(modelPath: string) {
  useGLTF.preload(modelPath)
}
