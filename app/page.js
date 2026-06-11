'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import DropZone from '@/components/DropZone';
import Header from '@/components/Header';
import ControlPanel from '@/components/ControlPanel';
import InfoPanel from '@/components/InfoPanel';
import styles from './page.module.css';

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <span>Cargando motor 3D...</span>
    </div>
  ),
});

// Helper to create example geometry URLs via Blob
function createExampleModel(type) {
  // We'll create a simple scene using Three.js and export to GLB
  return { type, isExample: true };
}

export default function Home() {
  // File state
  const [fileInfo, setFileInfo] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // View settings
  const [viewMode, setViewMode] = useState('textured');
  const [solidColor, setSolidColor] = useState('#94a3b8');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [background, setBackground] = useState('dark');

  // Lighting
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [directionalIntensity, setDirectionalIntensity] = useState(1.0);
  const [lightColor, setLightColor] = useState('#ffffff');

  // Screenshot
  const screenshotFnRef = useRef(null);

  // Info panel
  const [showInfo, setShowInfo] = useState(true);

  const handleFileLoad = useCallback((info) => {
    setFileInfo(info);
    setModelInfo(null);
    setShowViewer(true);
  }, []);

  const handleExampleLoad = useCallback(async (type) => {
    // Dynamically import THREE to create example geometries on the client
    const THREE = (await import('three')).default || (await import('three'));
    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter');

    const scene = new THREE.Scene();
    let geometry;
    let name;

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        name = 'Cubo.glb';
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 64, 64);
        name = 'Esfera.glb';
        break;
      case 'torus':
        geometry = new THREE.TorusKnotGeometry(0.8, 0.3, 128, 32);
        name = 'Torus.glb';
        break;
      case 'monkey':
        // Suzanne is complex — use icosahedron as stand-in
        geometry = new THREE.IcosahedronGeometry(1, 2);
        name = 'Suzanne.glb';
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        name = 'Ejemplo.glb';
    }

    const material = new THREE.MeshStandardMaterial({
      color: type === 'cube' ? '#3b82f6' :
             type === 'sphere' ? '#8b5cf6' :
             type === 'torus' ? '#f43f5e' :
             '#10b981',
      roughness: 0.3,
      metalness: 0.6,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        setFileInfo({ url, name, size: blob.size, type: 'glb' });
        setModelInfo(null);
        setShowViewer(true);
      },
      (error) => {
        console.error('Error exporting example:', error);
      },
      { binary: true }
    );
  }, []);

  const handleNewModel = useCallback(() => {
    if (fileInfo?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(fileInfo.url);
    }
    setFileInfo(null);
    setModelInfo(null);
    setShowViewer(false);
  }, [fileInfo]);

  const handleScreenshot = useCallback(() => {
    if (screenshotFnRef.current) {
      screenshotFnRef.current();
    }
  }, []);

  const handleModelInfo = useCallback((info) => {
    setModelInfo(info);
  }, []);

  return (
    <div className="app-container">
      {!showViewer ? (
        <DropZone onFileLoad={handleFileLoad} onExampleLoad={handleExampleLoad} />
      ) : (
        <>
          {/* Header */}
          <Header fileInfo={fileInfo} onNewModel={handleNewModel} />

          {/* 3D Canvas */}
          <div className={styles.canvasContainer}>
            <Scene
              fileUrl={fileInfo?.url}
              fileType={fileInfo?.type}
              viewMode={viewMode}
              solidColor={solidColor}
              showGrid={showGrid}
              showAxes={showAxes}
              autoRotate={autoRotate}
              background={background}
              ambientIntensity={ambientIntensity}
              directionalIntensity={directionalIntensity}
              lightColor={lightColor}
              onModelInfo={handleModelInfo}
              onScreenshotReady={(fn) => { screenshotFnRef.current = fn; }}
            />
          </div>

          {/* Control Panel */}
          <ControlPanel
            viewMode={viewMode}
            setViewMode={setViewMode}
            solidColor={solidColor}
            setSolidColor={setSolidColor}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showAxes={showAxes}
            setShowAxes={setShowAxes}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            background={background}
            setBackground={setBackground}
            ambientIntensity={ambientIntensity}
            setAmbientIntensity={setAmbientIntensity}
            directionalIntensity={directionalIntensity}
            setDirectionalIntensity={setDirectionalIntensity}
            lightColor={lightColor}
            setLightColor={setLightColor}
            onScreenshot={handleScreenshot}
            onNewModel={handleNewModel}
          />

          {/* Info Panel */}
          <InfoPanel
            fileInfo={fileInfo}
            modelInfo={modelInfo}
            visible={showInfo}
          />

          {/* Toggle Info Panel */}
          <button
            className={`btn btn-icon ${styles.infoToggle}`}
            onClick={() => setShowInfo(!showInfo)}
            title={showInfo ? 'Ocultar info' : 'Mostrar info'}
            id="toggle-info-panel"
          >
            ℹ️
          </button>
        </>
      )}
    </div>
  );
}
