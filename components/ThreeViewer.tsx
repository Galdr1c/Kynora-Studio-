import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { Box, Sun, Settings, Video, Camera, Download, Loader2, RotateCw, Maximize2, Zap, Palette, Layers, Sparkles } from 'lucide-react';

interface ThreeViewerProps {
  logoUrl: string;
}

type MaterialType = 'matte' | 'glossy' | 'metallic' | 'glass' | 'neon';

const ThreeViewer: React.FC<ThreeViewerProps> = ({ logoUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const logoMeshRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 3D Control States
  const [extrusion, setExtrusion] = useState(10);
  const [materialType, setMaterialType] = useState<MaterialType>('metallic');
  const [lightIntensity, setLightIntensity] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialization
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c0e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 400);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, 100, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-100, -100, 100);
    scene.add(pointLight);

    // Grid helper for spatial reference
    const grid = new THREE.GridHelper(1000, 20, 0x333333, 0x1a1a1a);
    grid.position.y = -150;
    scene.add(grid);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  // Update Mesh when Logo or Extrusion changes
  useEffect(() => {
    if (!sceneRef.current) return;

    const loader = new THREE.TextureLoader();
    loader.load(logoUrl, (texture) => {
      if (!sceneRef.current) return;

      // Remove previous mesh
      if (logoMeshRef.current) sceneRef.current.remove(logoMeshRef.current);

      const group = new THREE.Group();

      // We simulate extrusion of the PNG by placing two planes and a connecting edge
      // or creating a high-fidelity disc/box. For "Forge" feel, we'll create a 
      // "Slab" effect that respects transparency
      const textureAspect = texture.image.width / texture.image.height;
      const size = 180;
      const width = size * textureAspect;
      const height = size;

      // Create PBR material based on selection
      const getMaterial = () => {
        const props: THREE.MeshStandardMaterialParameters = {
          map: texture,
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide
        };

        switch (materialType) {
          case 'matte':
            props.roughness = 0.8;
            props.metalness = 0.1;
            break;
          case 'glossy':
            props.roughness = 0.1;
            props.metalness = 0.2;
            break;
          case 'metallic':
            props.roughness = 0.2;
            props.metalness = 0.9;
            break;
          case 'glass':
            props.opacity = 0.6;
            props.roughness = 0.05;
            props.metalness = 0.1;
            break;
          case 'neon':
            props.emissive = new THREE.Color(0xffffff);
            props.emissiveIntensity = 2;
            break;
        }
        return new THREE.MeshStandardMaterial(props);
      };

      const mat = getMaterial();

      // Front Face
      const geometry = new THREE.BoxGeometry(width, height, extrusion);
      // We apply the texture specifically to front and back
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }), // Right
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }), // Left
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }), // Top
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }), // Bottom
        mat, // Front
        mat  // Back
      ];

      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Add a subtle glow for neon
      if (materialType === 'neon') {
        const glow = new THREE.PointLight(0xffffff, 2, 200);
        group.add(glow);
      }

      sceneRef.current.add(group);
      logoMeshRef.current = group;
    });
  }, [logoUrl, extrusion, materialType]);

  const handleExportGLB = () => {
    if (!logoMeshRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(logoMeshRef.current, (gltf) => {
      const output = JSON.stringify(gltf, null, 2);
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kitcha-3d-logo.gltf';
      link.click();
    }, (error) => {
      console.error('Export failed', error);
    });
  };

  const handleCapturePNG = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'kitcha-3d-render.png';
    link.click();
  };

  const setCameraPreset = (type: 'front' | 'iso' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dist = 400;
    switch (type) {
      case 'front':
        cameraRef.current.position.set(0, 0, dist);
        break;
      case 'iso':
        cameraRef.current.position.set(dist, dist, dist);
        break;
      case 'top':
        cameraRef.current.position.set(0, dist, 0);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="flex h-[700px] bg-[#0c0c0e] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
      {/* Left Sidebar Controls */}
      <aside className="w-80 border-r border-white/5 flex flex-col bg-black/20 z-10 p-8 space-y-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-400">
            <Box size={20}/>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">3D Dimension</h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Physical Reconstruction</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Extrusion */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extrusion Depth</label>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{extrusion}px</span>
            </div>
            <input 
              type="range" min="1" max="100" value={extrusion} 
              onChange={(e) => setExtrusion(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Materials */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Core Material</label>
            <div className="grid grid-cols-2 gap-2">
              {(['matte', 'glossy', 'metallic', 'glass', 'neon'] as MaterialType[]).map(m => (
                <button 
                  key={m} 
                  onClick={() => setMaterialType(m)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${materialType === m ? 'bg-blue-600 border-transparent text-white shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Presets */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Camera Focus</label>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button onClick={() => setCameraPreset('front')} className="flex-1 py-2 text-[10px] font-black uppercase hover:text-white transition-all">Front</button>
              <button onClick={() => setCameraPreset('iso')} className="flex-1 py-2 text-[10px] font-black uppercase hover:text-white transition-all border-x border-white/5">Iso</button>
              <button onClick={() => setCameraPreset('top')} className="flex-1 py-2 text-[10px] font-black uppercase hover:text-white transition-all">Top</button>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="space-y-3">
          <button 
            onClick={handleExportGLB}
            className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 active:scale-95 shadow-2xl"
          >
            <Download size={14}/>
            <span>Export GLTF Model</span>
          </button>
          <button 
            onClick={handleCapturePNG}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center space-x-3 active:scale-95"
          >
            <Camera size={14}/>
            <span>Capture Render</span>
          </button>
        </div>
      </aside>

      {/* Main 3D Canvas Area */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* On-screen floating HUD */}
        <div className="absolute top-8 right-8 flex flex-col space-y-4">
           <div className="bg-black/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 shadow-2xl flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <RotateCw size={12} className="animate-spin-slow" />
                <span>Interactive Orbit Active</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-white">High Fidelity Mode</span>
              </div>
           </div>
        </div>

        {/* Bottom Tooltip */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ThreeViewer;