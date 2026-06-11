'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './DropZone.module.css';

const SUPPORTED_FORMATS = [
  { ext: '.glb', label: 'GLB', desc: 'Binary glTF' },
  { ext: '.gltf', label: 'GLTF', desc: 'GL Transmission Format' },
  { ext: '.obj', label: 'OBJ', desc: 'Wavefront OBJ' },
  { ext: '.fbx', label: 'FBX', desc: 'Filmbox' },
];

const EXAMPLE_MODELS = [
  { name: 'Cubo', type: 'cube', icon: '🧊' },
  { name: 'Esfera', type: 'sphere', icon: '🔮' },
  { name: 'Torus', type: 'torus', icon: '🍩' },
  { name: 'Mono (Suzanne)', type: 'monkey', icon: '🐵' },
];

export default function DropZone({ onFileLoad, onExampleLoad }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback((file) => {
    setError(null);
    const ext = file.name.split('.').pop().toLowerCase();
    const supported = ['glb', 'gltf', 'obj', 'fbx'];

    if (!supported.includes(ext)) {
      setError(`Formato .${ext} no soportado. Usa: ${supported.map(s => `.${s}`).join(', ')}`);
      return;
    }

    const url = URL.createObjectURL(file);
    onFileLoad({
      url,
      name: file.name,
      size: file.size,
      type: ext,
    });
  }, [onFileLoad]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div className={styles.overlay}>
      <div className={styles.bgOrbs}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={styles.content}>
        {/* Logo / Title */}
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
              <path d="M24 4v40M4 14l20 10 20-10M4 34l20-10 20 10" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <circle cx="24" cy="24" r="4" fill="url(#logoGrad)" opacity="0.8"/>
            </svg>
          </div>
          <h1 className={styles.title}>Blender 3D Viewer</h1>
          <p className={styles.subtitle}>
            Visualiza tus modelos 3D exportados desde Blender directamente en el navegador
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`${styles.dropArea} ${isDragging ? styles.dragging : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="drop-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="file-input"
          />

          <div className={styles.dropIcon}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path d="M28 8v28M18 26l10 10 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 36v8a4 4 0 004 4h32a4 4 0 004-4v-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className={styles.dropText}>
            <span className={styles.dropPrimary}>
              {isDragging ? '¡Suéltalo aquí!' : 'Arrastra tu modelo 3D aquí'}
            </span>
            <span className={styles.dropSecondary}>
              o haz clic para seleccionar archivo
            </span>
          </div>

          {/* Animated border */}
          <div className={styles.borderGlow} />
        </div>

        {error && (
          <div className={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Supported Formats */}
        <div className={styles.formatsSection}>
          <span className={styles.formatsLabel}>Formatos soportados</span>
          <div className={styles.formatsList}>
            {SUPPORTED_FORMATS.map((f) => (
              <div key={f.ext} className={styles.formatBadge}>
                <span className={styles.formatExt}>{f.label}</span>
                <span className={styles.formatDesc}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>o prueba con un ejemplo</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Example Models */}
        <div className={styles.examplesGrid}>
          {EXAMPLE_MODELS.map((model) => (
            <button
              key={model.type}
              className={styles.exampleBtn}
              onClick={() => onExampleLoad(model.type)}
              id={`example-${model.type}`}
            >
              <span className={styles.exampleIcon}>{model.icon}</span>
              <span className={styles.exampleName}>{model.name}</span>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className={styles.tip}>
          <span className={styles.tipIcon}>💡</span>
          <span>
            En Blender: <strong>File → Export → glTF 2.0 (.glb/.gltf)</strong> para mejores resultados
          </span>
        </div>
      </div>
    </div>
  );
}
