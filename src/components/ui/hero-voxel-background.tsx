import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Instances, Instance, Environment } from '@react-three/drei';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

// Reusable Voxel Component
const Voxel = ({ position, color, hoverScale = 1.2 }: any) => {
  const ref = useRef<any>();
  const [hovered, setHover] = useState(false);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    // Base position
    const [x, y, z] = position;
    
    // Mouse interaction
    // Calculate distance to mouse ray
    // We project the instance position to screen space to compare with mouse
    const vec = new THREE.Vector3(x, y, z);
    vec.project(state.camera);
    
    const mouseX = state.mouse.x;
    const mouseY = state.mouse.y;
    
    const dist = Math.sqrt(
      Math.pow(vec.x - mouseX, 2) + 
      Math.pow(vec.y - mouseY, 2)
    );
    
    // Wave effect based on mouse distance
    const targetY = y + (dist < 0.4 ? (1 - dist/0.4) * 0.5 : 0);
    
    // Smooth lerp
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.1);
    
    // Scale effect
    const targetScale = dist < 0.4 ? 1.1 : 1;
    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.1);
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetScale, 0.1);
    ref.current.scale.z = THREE.MathUtils.lerp(ref.current.scale.z, targetScale, 0.1);
  });

  return (
    <Instance
      ref={ref}
      position={position}
      color={color}
    />
  );
};

const VoxelGrid = ({ theme }: { theme: 'light' | 'dark' }) => {
  // Create a grid of voxels
  const voxels = useMemo(() => {
    const items = [];
    const size = 12; // 12x12 grid
    const gap = 0.6; // Spacing
    
    // Palette based on theme
    const isDark = theme === 'dark';
    const colors = {
      base: isDark ? "#1e293b" : "#e2e8f0", // slate-800 : slate-200
      treeTrunk: isDark ? "#334155" : "#475569", // slate-700 : slate-600
      treeLeaf: isDark ? "#166534" : "#22c55e", // green-700 : green-500
      code: isDark ? "#1d4ed8" : "#3b82f6", // blue-700 : blue-500
      error: isDark ? "#b91c1c" : "#ef4444", // red-700 : red-500
    };
    
    for (let x = -size/2; x < size/2; x++) {
      for (let z = -size/2; z < size/2; z++) {
        // Create a "terrain" using noise-like math
        const y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.5;
        
        let color = colors.base;
        
        // Add some "trees" or "structures"
        if (Math.random() > 0.95) {
           // "Tree" trunk
           items.push({ position: [x * gap, y + gap, z * gap], color: colors.treeTrunk });
           // Leaves
           items.push({ position: [x * gap, y + gap * 2, z * gap], color: colors.treeLeaf });
        } else if (Math.random() > 0.9) {
           // "Code block" (blue)
           color = colors.code;
        } else if (Math.random() > 0.9) {
           // "Error block" (red)
           color = colors.error;
        }
        
        items.push({ position: [x * gap, y, z * gap], color });
      }
    }
    return items;
  }, [theme]);

  return (
    <Instances range={1000}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} />
      
      {voxels.map((data, i) => (
        <Voxel key={i} {...data} />
      ))}
    </Instances>
  );
};

export const HeroVoxelBackground = () => {
  const { actualTheme } = useTheme();

  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [8, 8, 8], fov: 35 }}
        eventSource={document.body} // Crucial: Listen to events on body to work behind content
        eventPrefix="client"
        shadows
      >
        <ambientLight intensity={actualTheme === 'dark' ? 0.2 : 0.8} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={actualTheme === 'dark' ? 0.5 : 1.5} 
          castShadow 
        />
        <directionalLight 
          position={[-10, -10, -5]} 
          intensity={actualTheme === 'dark' ? 0.2 : 0.5} 
          color={actualTheme === 'dark' ? "#1e3a8a" : "#bfdbfe"} 
        />
        
        <Environment preset={actualTheme === 'dark' ? "night" : "city"} />
        
        <SceneContent theme={actualTheme} />
        
        {/* Camera Rig for subtle movement */}
        <CameraRig />
      </Canvas>
      
      {/* Fade overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${actualTheme === 'dark' ? 'to-background' : 'to-white/90'} pointer-events-none`} />
    </div>
  );
};

function SceneContent({ theme }: { theme: 'light' | 'dark' }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Rotate based on scroll
      const scrollY = window.scrollY;
      const rotationSpeed = 0.001;
      groupRef.current.rotation.y = Math.PI / 4 + scrollY * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, Math.PI / 4, 0]}>
       <VoxelGrid theme={theme} />
    </group>
  );
}

function CameraRig() {
  useFrame((state, delta) => {
    // Subtle camera movement following mouse
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 8 + state.mouse.x * 2, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 8 + state.mouse.y * 2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
