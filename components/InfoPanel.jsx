'use client';

import styles from './InfoPanel.module.css';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export default function InfoPanel({ fileInfo, modelInfo, visible }) {
  if (!visible || !fileInfo) return null;

  return (
    <div className={styles.panel}>
      {/* File Name */}
      <div className={styles.fileName}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5L9 1z" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
        <span className={styles.name} title={fileInfo.name}>{fileInfo.name}</span>
        <span className={`badge ${
          fileInfo.type === 'glb' || fileInfo.type === 'gltf' ? '' :
          fileInfo.type === 'obj' ? 'badge-purple' :
          'badge-amber'
        }`}>
          .{fileInfo.type?.toUpperCase()}
        </span>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {fileInfo.size ? formatBytes(fileInfo.size) : '—'}
          </span>
          <span className={styles.statLabel}>Tamaño</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {modelInfo?.vertices ? formatNumber(modelInfo.vertices) : '—'}
          </span>
          <span className={styles.statLabel}>Vértices</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {modelInfo?.faces ? formatNumber(modelInfo.faces) : '—'}
          </span>
          <span className={styles.statLabel}>Caras</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {modelInfo?.materials ? modelInfo.materials.length : '—'}
          </span>
          <span className={styles.statLabel}>Materiales</span>
        </div>
      </div>

      {/* Dimensions */}
      {modelInfo?.dimensions && (
        <div className={styles.dimensions}>
          <span className={styles.dimLabel}>Dimensiones</span>
          <div className={styles.dimValues}>
            <span className={styles.dimAxis}>
              <span className={styles.axisX}>X</span> {modelInfo.dimensions.x}
            </span>
            <span className={styles.dimAxis}>
              <span className={styles.axisY}>Y</span> {modelInfo.dimensions.y}
            </span>
            <span className={styles.dimAxis}>
              <span className={styles.axisZ}>Z</span> {modelInfo.dimensions.z}
            </span>
          </div>
        </div>
      )}

      {/* Materials List */}
      {modelInfo?.materials && modelInfo.materials.length > 0 && (
        <div className={styles.materialsSection}>
          <span className={styles.dimLabel}>Materiales</span>
          <div className={styles.materialsList}>
            {modelInfo.materials.slice(0, 5).map((mat, i) => (
              <span key={i} className={styles.materialBadge}>{mat}</span>
            ))}
            {modelInfo.materials.length > 5 && (
              <span className={styles.materialBadge}>+{modelInfo.materials.length - 5} más</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
