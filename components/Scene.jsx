'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Stars,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import ModelViewer from './ModelViewer';
import LoadingIndicator from './LoadingIndicator';

// Camera setup component
function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// Properly set the Three.js scene background
function SceneBackground({ background }) {
  const { scene } = useThree();

  useEffect(() => {
    if (background === 'environment') {
      // Let the Environment component handle the background
      // Don't set scene.background so the env map takes over
      scene.background = null;
    } else {
      let color;
      switch (background) {
        case 'light':
          color = '#e2e8f0';
          break;
        case 'dark':
          color = '#0a0e1a';
          break;
        case 'midnight':
          color = '#020617';
          break;
        case 'stars':
          color = '#050816';
          break;
        default:
          color = '#111827';
      }
      scene.background = new THREE.Color(color);
    }
  }, [background, scene]);

  return null;
}

// Lighting rig
function LightingRig({ ambientIntensity, directionalIntensity, lightColor }) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} color={lightColor} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={directionalIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-5, 3, -5]}
        intensity={directionalIntensity * 0.3}
        color="#6366f1"
      />
      <pointLight position={[0, 5, 0]} intensity={directionalIntensity * 0.2} color="#06b6d4" />
    </>
  );
}

// Screenshot helper
function ScreenshotHelper({ onScreenshotReady }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (onScreenshotReady) {
      onScreenshotReady(() => {
        gl.render(scene, camera);
        const dataUrl = gl.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'blender-viewer-screenshot.png';
        link.href = dataUrl;
        link.click();
      });
    }
  }, [gl, scene, camera, onScreenshotReady]);

  return null;
}

export default function Scene({
  fileUrl,
  fileType,
  viewMode,
  solidColor,
  showGrid,
  showAxes,
  autoRotate,
  background,
  ambientIntensity,
  directionalIntensity,
  lightColor,
  onModelInfo,
  onScreenshotReady,
}) {
  const controlsRef = useRef();

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      camera={{ position: [4, 3, 5], fov: 50, near: 0.1, far: 1000 }}
    >
      <CameraSetup />
      <SceneBackground background={background} />

      <LightingRig
        ambientIntensity={ambientIntensity}
        directionalIntensity={directionalIntensity}
        lightColor={lightColor}
      />

      {/* Environment map — wrapped in Suspense since it loads HDR from CDN */}
      <Suspense fallback={null}>
        {background === 'environment' && (
          <Environment preset="city" background blur={0.6} />
        )}
      </Suspense>

      {/* Stars background */}
      {background === 'stars' && (
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      )}

      {/* Grid */}
      {showGrid && (
        <Grid
          position={[0, -1.5, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#1e3a5f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#3b82f6"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      )}

      {/* Axes */}
      {showAxes && (
        <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
          <GizmoViewport
            axisColors={['#f43f5e', '#10b981', '#3b82f6']}
            labelColor="white"
          />
        </GizmoHelper>
      )}

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />

      {/* Model */}
      <Suspense fallback={<LoadingIndicator />}>
        {fileUrl && (
          <ModelViewer
            fileUrl={fileUrl}
            fileType={fileType}
            viewMode={viewMode}
            solidColor={solidColor}
            onModelInfo={onModelInfo}
          />
        )}
      </Suspense>

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        minDistance={1}
        maxDistance={50}
        enablePan
      />

      <ScreenshotHelper onScreenshotReady={onScreenshotReady} />
    </Canvas>
  );
}
