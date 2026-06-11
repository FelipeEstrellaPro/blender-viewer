'use client';

import { useState } from 'react';
import styles from './ControlPanel.module.css';

export default function ControlPanel({
  viewMode,
  setViewMode,
  solidColor,
  setSolidColor,
  showGrid,
  setShowGrid,
  showAxes,
  setShowAxes,
  autoRotate,
  setAutoRotate,
  background,
  setBackground,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
  lightColor,
  setLightColor,
  onScreenshot,
  onResetCamera,
  onNewModel,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [lightingOpen, setLightingOpen] = useState(false);

  const backgrounds = [
    { value: 'dark', label: 'Oscuro', icon: '🌑' },
    { value: 'midnight', label: 'Medianoche', icon: '🌌' },
    { value: 'light', label: 'Claro', icon: '☀️' },
    { value: 'environment', label: 'Entorno', icon: '🏙️' },
    { value: 'stars', label: 'Estrellas', icon: '✨' },
  ];

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ''}`}>
      {/* Collapse Toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(!collapsed)}
        id="toggle-panel"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d={collapsed ? 'M6 4l4 4-4 4' : 'M10 4l-4 4 4 4'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {!collapsed && (
        <div className={styles.panelContent}>
          {/* View Mode */}
          <div className={styles.section}>
            <span className="section-label">Modo de Vista</span>
            <div className="toggle-group">
              {[
                { value: 'textured', label: '🎨 Texturas' },
                { value: 'solid', label: '🔲 Sólido' },
                { value: 'wireframe', label: '📐 Wire' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  className={`toggle-btn ${viewMode === mode.value ? 'active' : ''}`}
                  onClick={() => setViewMode(mode.value)}
                  id={`view-${mode.value}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {viewMode === 'solid' && (
              <div className={styles.colorRow}>
                <span className={styles.colorLabel}>Color sólido</span>
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  id="solid-color-picker"
                />
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Display Options */}
          <div className={styles.section}>
            <span className="section-label">Visualización</span>
            <div className={styles.toggleList}>
              <label className={styles.toggleItem} id="toggle-grid">
                <span className={styles.toggleIcon}>⊞</span>
                <span className={styles.toggleText}>Grid</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.switch} />
              </label>

              <label className={styles.toggleItem} id="toggle-axes">
                <span className={styles.toggleIcon}>⟐</span>
                <span className={styles.toggleText}>Ejes XYZ</span>
                <input
                  type="checkbox"
                  checked={showAxes}
                  onChange={(e) => setShowAxes(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.switch} />
              </label>

              <label className={styles.toggleItem} id="toggle-autorotate">
                <span className={styles.toggleIcon}>↻</span>
                <span className={styles.toggleText}>Auto-Rotar</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.switch} />
              </label>
            </div>
          </div>

          <hr className="divider" />

          {/* Background */}
          <div className={styles.section}>
            <span className="section-label">Fondo</span>
            <div className={styles.bgGrid}>
              {backgrounds.map((bg) => (
                <button
                  key={bg.value}
                  className={`${styles.bgBtn} ${background === bg.value ? styles.bgActive : ''}`}
                  onClick={() => setBackground(bg.value)}
                  title={bg.label}
                  id={`bg-${bg.value}`}
                >
                  <span className={styles.bgIcon}>{bg.icon}</span>
                  <span className={styles.bgLabel}>{bg.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Lighting */}
          <div className={styles.section}>
            <button
              className={styles.sectionToggle}
              onClick={() => setLightingOpen(!lightingOpen)}
              id="toggle-lighting-section"
            >
              <span className="section-label" style={{ marginBottom: 0 }}>💡 Iluminación</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`${styles.chevron} ${lightingOpen ? styles.chevronOpen : ''}`}
              >
                <path d="M4 5.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {lightingOpen && (
              <div className={styles.lightingContent}>
                <div className="slider-container">
                  <div className="slider-label">
                    <span>Ambiente</span>
                    <span className="slider-value">{ambientIntensity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={ambientIntensity}
                    onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                    id="ambient-slider"
                  />
                </div>

                <div className="slider-container">
                  <div className="slider-label">
                    <span>Direccional</span>
                    <span className="slider-value">{directionalIntensity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={directionalIntensity}
                    onChange={(e) => setDirectionalIntensity(parseFloat(e.target.value))}
                    id="directional-slider"
                  />
                </div>

                <div className={styles.colorRow}>
                  <span className={styles.colorLabel}>Color de luz</span>
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    id="light-color-picker"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Actions */}
          <div className={styles.section}>
            <div className={styles.actionBtns}>
              <button className="btn btn-ghost" onClick={onScreenshot} id="btn-screenshot">
                📸 Screenshot
              </button>
              <button className="btn btn-ghost" onClick={onNewModel} id="btn-new-model">
                📂 Nuevo Modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
