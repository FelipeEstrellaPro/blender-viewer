'use client';

import styles from './Header.module.css';

export default function Header({ fileInfo, onNewModel }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="hLogoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke="url(#hLogoGrad)" strokeWidth="2.5" fill="none"/>
            <path d="M24 4v40M4 14l20 10 20-10" stroke="url(#hLogoGrad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <circle cx="24" cy="24" r="3.5" fill="url(#hLogoGrad)" opacity="0.9"/>
          </svg>
          <span className={styles.logoText}>Blender 3D Viewer</span>
        </div>
      </div>

      <div className={styles.center}>
        {fileInfo && (
          <div className={styles.fileIndicator}>
            <span className={styles.fileIcon}>📦</span>
            <span className={styles.fileName}>{fileInfo.name}</span>
            <span className={`badge ${
              fileInfo.type === 'glb' || fileInfo.type === 'gltf' ? '' :
              fileInfo.type === 'obj' ? 'badge-purple' :
              fileInfo.type === 'fbx' ? 'badge-amber' :
              'badge-emerald'
            }`}>
              .{fileInfo.type?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className={styles.right}>
        {fileInfo && (
          <button className="btn btn-ghost" onClick={onNewModel} id="header-new-model">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="hide-mobile">Nuevo</span>
          </button>
        )}

        <a
          href="https://docs.blender.org/manual/en/latest/files/import_export/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-icon tooltip-wrapper ${styles.helpBtn}`}
          data-tooltip="Ayuda de exportación"
          id="help-link"
        >
          ?
        </a>
      </div>
    </header>
  );
}
