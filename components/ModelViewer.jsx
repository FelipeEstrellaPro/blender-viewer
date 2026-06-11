'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useFBX } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

// Helper to traverse and collect model info
function getModelInfo(object) {
  let vertices = 0;
  let faces = 0;
  const materials = new Set();

  object.traverse((child) => {
    if (child.isMesh) {
      const geo = child.geometry;
      if (geo.attributes.position) {
        vertices += geo.attributes.position.count;
      }
      if (geo.index) {
        faces += geo.index.count / 3;
      } else if (geo.attributes.position) {
        faces += geo.attributes.position.count / 3;
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => materials.add(m.name || 'Unnamed'));
        } else {
          materials.add(child.material.name || 'Unnamed');
        }
      }
    }
  });

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    vertices,
    faces: Math.floor(faces),
    materials: [...materials],
    dimensions: {
      x: parseFloat(size.x.toFixed(3)),
      y: parseFloat(size.y.toFixed(3)),
      z: parseFloat(size.z.toFixed(3)),
    },
  };
}

// Center and scale model to fit in view
function normalizeModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 3 / maxDim;

  object.position.sub(center);
  object.position.multiplyScalar(scale);
  object.scale.multiplyScalar(scale);

  return object;
}

// GLTF/GLB Loader component
function GLTFModel({ url, viewMode, solidColor, onModelLoaded }) {
  const gltf = useGLTF(url);
  const modelRef = useRef();
  const originalMaterials = useRef(new Map());

  useEffect(() => {
    if (gltf.scene) {
      const cloned = gltf.scene.clone(true);
      normalizeModel(cloned);

      // Store original materials
      cloned.traverse((child) => {
        if (child.isMesh) {
          originalMaterials.current.set(child.uuid, child.material.clone ? child.material.clone() : child.material);
        }
      });

      if (modelRef.current) {
        // Clear old children
        while (modelRef.current.children.length > 0) {
          modelRef.current.remove(modelRef.current.children[0]);
        }
        modelRef.current.add(cloned);
      }

      const info = getModelInfo(cloned);
      onModelLoaded(info);
    }
  }, [gltf, url]);

  // Apply view mode
  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        switch (viewMode) {
          case 'wireframe':
            child.material = new THREE.MeshBasicMaterial({
              color: '#3b82f6',
              wireframe: true,
              transparent: true,
              opacity: 0.7,
            });
            break;
          case 'solid':
            child.material = new THREE.MeshStandardMaterial({
              color: solidColor || '#94a3b8',
              roughness: 0.5,
              metalness: 0.1,
            });
            break;
          case 'textured':
          default:
            const orig = originalMaterials.current.get(child.uuid);
            if (orig) {
              child.material = orig.clone ? orig.clone() : orig;
            }
            break;
        }
      }
    });
  }, [viewMode, solidColor]);

  return <group ref={modelRef} />;
}

// OBJ Loader component
function OBJModel({ url, viewMode, solidColor, onModelLoaded }) {
  const [model, setModel] = useState(null);
  const modelRef = useRef();
  const originalMaterials = useRef(new Map());

  useEffect(() => {
    const loader = new OBJLoader();
    loader.load(url, (obj) => {
      normalizeModel(obj);
      // Assign default materials if none
      obj.traverse((child) => {
        if (child.isMesh) {
          if (!child.material || (child.material.type === 'MeshPhongMaterial' && !child.material.map)) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#94a3b8',
              roughness: 0.5,
              metalness: 0.1,
            });
          }
          originalMaterials.current.set(child.uuid, child.material.clone ? child.material.clone() : child.material);
        }
      });
      setModel(obj);
      const info = getModelInfo(obj);
      onModelLoaded(info);
    });

    return () => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        switch (viewMode) {
          case 'wireframe':
            child.material = new THREE.MeshBasicMaterial({
              color: '#3b82f6',
              wireframe: true,
              transparent: true,
              opacity: 0.7,
            });
            break;
          case 'solid':
            child.material = new THREE.MeshStandardMaterial({
              color: solidColor || '#94a3b8',
              roughness: 0.5,
              metalness: 0.1,
            });
            break;
          case 'textured':
          default:
            const orig = originalMaterials.current.get(child.uuid);
            if (orig) {
              child.material = orig.clone ? orig.clone() : orig;
            }
            break;
        }
      }
    });
  }, [viewMode, solidColor]);

  if (!model) return null;
  return <primitive ref={modelRef} object={model} />;
}

// Convert FBX Phong materials to PBR Standard materials preserving colors & textures
function convertFBXMaterial(material) {
  if (!material) {
    return new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.5,
      metalness: 0.1,
    });
  }

  // If it's already a standard/physical material, just return it
  if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
    return material;
  }

  // Convert Phong/Lambert/Basic to Standard
  const newMat = new THREE.MeshStandardMaterial();

  // Preserve diffuse color
  if (material.color) {
    newMat.color.copy(material.color);
  }

  // Preserve diffuse/color map (texture)
  if (material.map) {
    newMat.map = material.map;
  }

  // Preserve normal map
  if (material.normalMap) {
    newMat.normalMap = material.normalMap;
    if (material.normalScale) {
      newMat.normalScale.copy(material.normalScale);
    }
  }

  // Preserve bump map as normal map fallback
  if (!newMat.normalMap && material.bumpMap) {
    newMat.bumpMap = material.bumpMap;
    newMat.bumpScale = material.bumpScale || 1;
  }

  // Preserve emissive
  if (material.emissive) {
    newMat.emissive.copy(material.emissive);
    newMat.emissiveIntensity = material.emissiveIntensity || 1;
  }
  if (material.emissiveMap) {
    newMat.emissiveMap = material.emissiveMap;
  }

  // Preserve alpha/opacity
  if (material.transparent) {
    newMat.transparent = true;
    newMat.opacity = material.opacity !== undefined ? material.opacity : 1;
  }
  if (material.alphaMap) {
    newMat.alphaMap = material.alphaMap;
    newMat.transparent = true;
  }
  if (material.alphaTest) {
    newMat.alphaTest = material.alphaTest;
  }

  // Preserve side rendering
  newMat.side = material.side !== undefined ? material.side : THREE.FrontSide;

  // Derive roughness from shininess (Phong → PBR conversion)
  if (material.shininess !== undefined) {
    // Higher shininess = lower roughness
    newMat.roughness = Math.max(0.05, 1 - (material.shininess / 100));
  } else {
    newMat.roughness = 0.6;
  }

  // Derive metalness from specular color
  if (material.specular) {
    const specLum = material.specular.r * 0.299 + material.specular.g * 0.587 + material.specular.b * 0.114;
    newMat.metalness = Math.min(specLum, 0.5);
  } else {
    newMat.metalness = 0.05;
  }

  // Preserve specular map as roughness map
  if (material.specularMap) {
    newMat.roughnessMap = material.specularMap;
  }

  // Preserve name
  newMat.name = material.name || '';

  return newMat;
}

// FBX Loader component
function FBXModel({ url, viewMode, solidColor, onModelLoaded }) {
  const [model, setModel] = useState(null);
  const modelRef = useRef();
  const originalMaterials = useRef(new Map());

  useEffect(() => {
    import('three/examples/jsm/loaders/FBXLoader').then(({ FBXLoader }) => {
      const loader = new FBXLoader();
      loader.load(url, (fbx) => {
        normalizeModel(fbx);

        // Convert all FBX materials to PBR Standard
        fbx.traverse((child) => {
          if (child.isMesh) {
            if (Array.isArray(child.material)) {
              child.material = child.material.map((m) => convertFBXMaterial(m));
            } else {
              child.material = convertFBXMaterial(child.material);
            }
            // Store the converted material as original
            const matClone = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : child.material.clone();
            originalMaterials.current.set(child.uuid, matClone);
          }
        });

        setModel(fbx);
        const info = getModelInfo(fbx);
        onModelLoaded(info);
      });
    });

    return () => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        switch (viewMode) {
          case 'wireframe':
            child.material = new THREE.MeshBasicMaterial({
              color: '#3b82f6',
              wireframe: true,
              transparent: true,
              opacity: 0.7,
            });
            break;
          case 'solid':
            child.material = new THREE.MeshStandardMaterial({
              color: solidColor || '#94a3b8',
              roughness: 0.5,
              metalness: 0.1,
            });
            break;
          case 'textured':
          default:
            const orig = originalMaterials.current.get(child.uuid);
            if (orig) {
              child.material = Array.isArray(orig)
                ? orig.map((m) => m.clone())
                : orig.clone();
            }
            break;
        }
      }
    });
  }, [viewMode, solidColor]);

  if (!model) return null;
  return <primitive ref={modelRef} object={model} />;
}

// Main model viewer component
export default function ModelViewer({ fileUrl, fileType, viewMode, solidColor, onModelInfo }) {
  const handleModelLoaded = (info) => {
    if (onModelInfo) {
      onModelInfo(info);
    }
  };

  const type = fileType?.toLowerCase();

  if (type === 'glb' || type === 'gltf') {
    return <GLTFModel url={fileUrl} viewMode={viewMode} solidColor={solidColor} onModelLoaded={handleModelLoaded} />;
  }

  if (type === 'obj') {
    return <OBJModel url={fileUrl} viewMode={viewMode} solidColor={solidColor} onModelLoaded={handleModelLoaded} />;
  }

  if (type === 'fbx') {
    return <FBXModel url={fileUrl} viewMode={viewMode} solidColor={solidColor} onModelLoaded={handleModelLoaded} />;
  }

  return null;
}
