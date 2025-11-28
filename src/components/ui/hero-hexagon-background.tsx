import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Instances, Instance, Environment, Float } from '@react-three/drei';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

const Hexagon = ({ position, color, ...props }: any) => {
  const ref = useRef<any>();
  const [hovered, setHover] = useState(false);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    // Mouse interaction
    const vec = new THREE.Vector3(position[0], position[1], position[2]);
    vec.project(state.camera);
    
    const mouseX = state.mouse.x;
    const mouseY = state.mouse.y;
    
    const dist = Math.sqrt(
      Math.pow(vec.x - mouseX, 2) + 
      Math.pow(vec.y - mouseY, 2)
    );
    
    // Ripple/Wave effect
    // When mouse is close, scale up and move up
    const isClose = dist < 0.3;
    
    const targetScale = isClose ? 1.4 : 1;
    const targetY = isClose ? 0.5 : 0;
    const targetRotation = isClose ? Math.PI / 6 : 0;

    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.1);
    ref.current.scale.z = THREE.MathUtils.lerp(ref.current.scale.z, targetScale, 0.1);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotation, 0.05);
    
    // Color shift on hover (handled by material prop usually, but we can try to animate if needed)
  });

  return (
    <Instance
      ref={ref}
      position={position}
      color={color}
      {...props}
    />
  );
};

const HexGrid = ({ theme }: { theme: 'light' | 'dark' }) => {
  const { items, colors } = useMemo(() => {
    const items = [];
    const radius = 10; // Grid size
    const hexRadius = 0.6;
    const hexWidth = hexRadius * 2;
    const hexHeight = Math.sqrt(3) * hexRadius;
    
    const isDark = theme === 'dark';
    const colors = {
      base: isDark ? "#1e293b" : "#f1f5f9", // slate-800 : slate-100
      highlight: isDark ? "#3b82f6" : "#60a5fa", // blue-500 : blue-400
      accent: isDark ? "#6366f1" : "#818cf8", // indigo-500 : indigo-400
    };

    // Hexagon grid logic
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        const x = hexWidth * (q + r/2);
        const z = hexHeight * r;
        
        // Randomize initial height slightly
        const y = (Math.random() - 0.5) * 0.2;
        
        let color = colors.base;
        const rand = Math.random();
        if (rand > 0.95) color = colors.highlight;
        else if (rand > 0.9) color = colors.accent;

        items.push({ position: [x, y, z], color });
      }
    }
    return { items, colors };
  }, [theme]);

  return (
    <Instances range={1000}>
      <cylinderGeometry args={[0.6, 0.6, 0.2, 6]} />
      <meshStandardMaterial roughness={0.2} metalness={0.5} />
      
      {items.map((data, i) => (
        <Hexagon key={i} {...data} />
      ))}
    </Instances>
  );
};

export const HeroHexagonBackground = () => {
  const { actualTheme } = useTheme();

  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 10, 10], fov: 40 }}
        eventSource={document.body}
        eventPrefix="client"
        shadows
      >
        <ambientLight intensity={actualTheme === 'dark' ? 0.5 : 0.8} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Environment preset={actualTheme === 'dark' ? "city" : "studio"} />
        
        <SceneContent theme={actualTheme} />
      </Canvas>
      
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${actualTheme === 'dark' ? 'to-background' : 'to-white/90'} pointer-events-none`} />
    </div>
  );
};

function SceneContent({ theme }: { theme: 'light' | 'dark' }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Scroll interaction: Tilt the whole grid
      const scrollY = window.scrollY;
      const targetRotationX = -Math.PI / 6 + (scrollY * 0.0005);
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      
      // Mouse interaction: Slight tilt
      const { mouse } = state;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, mouse.x * 0.05, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.y * 0.05, 0.05);
    }
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 6, 0, 0]}>
       <HexGrid theme={theme} />
    </group>
  );
}
