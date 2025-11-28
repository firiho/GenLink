import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Trail, Icosahedron } from '@react-three/drei';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

function Satellite({ radius, speed, color, offset, inclination }: any) {
  const ref = useRef<any>();
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    
    // Orbital motion
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    
    // Rotate the satellite itself
    ref.current.rotation.x += 0.02;
    ref.current.rotation.y += 0.02;
  });

  return (
    <group rotation={[inclination, 0, 0]}>
        {/* Orbital Path Line */}
        <mesh rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>

        {/* The Satellite */}
        <group ref={ref}>
            <mesh>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Trail */}
            <Trail
                width={1.5}
                length={8}
                color={new THREE.Color(color)}
                attenuation={(t) => t * t}
            >
                <mesh visible={false}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                </mesh>
            </Trail>
        </group>
    </group>
  );
}

function SceneContent({ theme }: { theme: 'light' | 'dark' }) {
    const groupRef = useRef<THREE.Group>(null);
    const isDark = theme === 'dark';
    
    // Colors - High contrast for light mode, Neon for dark mode
    const coreColor = isDark ? "#3b82f6" : "#2563eb"; // Blue
    const sat1Color = isDark ? "#60a5fa" : "#2563eb"; // Blue
    const sat2Color = isDark ? "#a855f7" : "#7c3aed"; // Purple
    const sat3Color = isDark ? "#22d3ee" : "#0891b2"; // Cyan

    useFrame((state) => {
        if (!groupRef.current) return;
        
        // Mouse Interaction: Tilt the whole system
        const { mouse } = state;
        // Smooth lerp for rotation
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.5, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.5, 0.05);
        
        // Scroll Interaction: Rotate base slightly based on scroll
        const scrollY = window.scrollY;
        groupRef.current.rotation.z = scrollY * 0.0005;
    });

    return (
        <group ref={groupRef}>
            {/* Central Core */}
            <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
                {/* Wireframe Outer Core */}
                <Icosahedron args={[1.5, 0]}>
                    <meshStandardMaterial 
                        color={coreColor} 
                        wireframe 
                        transparent 
                        opacity={isDark ? 0.2 : 0.1} 
                    />
                </Icosahedron>
                {/* Solid Inner Core */}
                <Icosahedron args={[0.8, 0]}>
                    <meshStandardMaterial 
                        color={coreColor} 
                        roughness={0.1}
                        metalness={0.9}
                    />
                </Icosahedron>
            </Float>

            {/* Satellites */}
            <Satellite radius={3} speed={0.8} color={sat1Color} offset={0} inclination={Math.PI / 6} />
            <Satellite radius={4.5} speed={0.6} color={sat2Color} offset={2} inclination={-Math.PI / 8} />
            <Satellite radius={6} speed={0.4} color={sat3Color} offset={4} inclination={Math.PI / 3} />
        </group>
    );
}

export const HeroOrbitalBackground = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 45 }}
        eventSource={document.body}
        eventPrefix="client"
        shadows
      >
        <ambientLight intensity={isDark ? 0.5 : 1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <SceneContent theme={actualTheme} />
      </Canvas>
      
      {/* Fade Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${isDark ? 'to-background' : 'to-white/90'} pointer-events-none`} />
    </div>
  );
};
