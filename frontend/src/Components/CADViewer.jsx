import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { 
  Maximize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  RefreshCw,
  Download,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../css/CADViewer.css';

// Import UI components
import { Tooltip } from './UI/Elements';

// Model component to display the 3D model
function Model({ model }) {
  return <primitive object={model} />;
}

// Custom controller component to handle rotation
const ControlsHandler = ({ controlsRef }) => {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    if (controlsRef.current) {
      // Store the camera position reference in the ref
      controlsRef.current.camera = camera;
      controlsRef.current.domElement = gl.domElement;
    }
  }, [camera, gl, controlsRef]);
  
  return null;
};

const CADViewer = ({ modelFile, onClose }) => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeControl, setActiveControl] = useState(null);
  const [showRotateControls, setShowRotateControls] = useState(false);
  const [showGrid, setShowGrid] = useState(false); // Added state for grid visibility
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  // Load the 3D model
  useEffect(() => {
    if (!modelFile) return;

    setIsLoading(true);
    setError(null);

    const fileExtension = modelFile.name.split('.').pop().toLowerCase();
    
    const handleLoadError = (err) => {
      console.error('Error loading model:', err);
      setError('Failed to load the 3D model. Please try a different file.');
      setIsLoading(false);
    };

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      
      try {
        let loadedModel;
        
        if (fileExtension === 'stl') {
          const loader = new STLLoader();
          const geometry = loader.parse(arrayBuffer);
          const material = new MeshStandardMaterial({ 
            color: 0x1976d2,
            roughness: 0.5,
            metalness: 0.2
          });
          loadedModel = new Mesh(geometry, material);
        } else if (fileExtension === 'obj') {
          const loader = new OBJLoader();
          // Convert ArrayBuffer to text for OBJ loader
          const text = new TextDecoder().decode(arrayBuffer);
          loadedModel = loader.parse(text);
          
          // Apply material to all meshes in the OBJ
          loadedModel.traverse((child) => {
            if (child instanceof Mesh) {
              child.material = new MeshStandardMaterial({ 
                color: 0x1976d2,
                roughness: 0.5,
                metalness: 0.2
              });
            }
          });
        }

        if (loadedModel) {
          // Center the model
          loadedModel.position.set(0, 0, 0);
          setModel(loadedModel);
          setIsLoading(false);
        }
      } catch (err) {
        handleLoadError(err);
      }
    };
    
    reader.onerror = handleLoadError;
    
    if (fileExtension === 'stl' || fileExtension === 'obj') {
      reader.readAsArrayBuffer(modelFile);
    } else {
      setError('Unsupported file format. Please upload STL or OBJ files.');
      setIsLoading(false);
    }
  }, [modelFile]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Reset camera view
  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Control handlers
  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
    }
  };

  // Improved toggle rotate controls function
  const toggleRotateControls = () => {
    setShowRotateControls(!showRotateControls);
    setActiveControl(showRotateControls ? null : 'rotate');
  };

  // Fixed rotation methods that use OrbitControls correctly
  const rotateLeft = () => {
    if (controlsRef.current) {
      const currentAzimuth = controlsRef.current.getAzimuthalAngle();
      controlsRef.current.setAzimuthalAngle(currentAzimuth - 0.2);
      controlsRef.current.update();
    }
  };

  const rotateRight = () => {
    if (controlsRef.current) {
      const currentAzimuth = controlsRef.current.getAzimuthalAngle();
      controlsRef.current.setAzimuthalAngle(currentAzimuth + 0.2);
      controlsRef.current.update();
    }
  };

  const rotateUp = () => {
    if (controlsRef.current) {
      const currentPolar = controlsRef.current.getPolarAngle();
      controlsRef.current.setPolarAngle(Math.max(0.1, currentPolar - 0.2)); 
      controlsRef.current.update();
    }
  };

  const rotateDown = () => {
    if (controlsRef.current) {
      const currentPolar = controlsRef.current.getPolarAngle();
      controlsRef.current.setPolarAngle(Math.min(Math.PI - 0.1, currentPolar + 0.2));
      controlsRef.current.update();
    }
  };

  // Pan mode
  const setPanMode = () => {
    if (controlsRef.current) {
      controlsRef.current.enableRotate = false;
      controlsRef.current.enablePan = true;
      setActiveControl('pan');
      setShowRotateControls(false);
    }
  };

  // Reset to default interaction mode
  const resetControlMode = () => {
    if (controlsRef.current) {
      controlsRef.current.enableRotate = true;
      controlsRef.current.enablePan = true;
      setActiveControl(null);
      setShowRotateControls(false);
    }
  };

  // Export model (placeholder)
  const exportModel = () => {
    alert("Export functionality will be implemented here");
  };

  // Toggle grid
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Render rotation controls in a grid layout for fullscreen
  const renderGridRotationControls = () => {
    return (
      <div className="rotation-controls-container">
        <button className="control-button rotation-up-button" onClick={rotateUp}>
          <ChevronUp size={20} />
        </button>
        <button className="control-button rotation-left-button" onClick={rotateLeft}>
          <ChevronLeft size={20} />
        </button>
        <button className="control-button rotation-right-button" onClick={rotateRight}>
          <ChevronRight size={20} />
        </button>
        <button className="control-button rotation-down-button" onClick={rotateDown}>
          <ChevronDown size={20} />
        </button>
      </div>
    );
  };

  // Render rotation controls in a horizontal line for non-fullscreen
  const renderHorizontalRotationControls = () => {
    return (
      <div className="horizontal-rotation-controls">
        <button className="control-button" onClick={rotateLeft}>
          <ChevronLeft size={20} />
        </button>
        <button className="control-button" onClick={rotateUp}>
          <ChevronUp size={20} />
        </button>
        <button className="control-button" onClick={rotateDown}>
          <ChevronDown size={20} />
        </button>
        <button className="control-button" onClick={rotateRight}>
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="cad-viewer">
      <div className="cad-viewer-header">
        <h2>{modelFile ? modelFile.name : 'CAD Viewer'}</h2>
        <button className="close-button" onClick={onClose}><X size={20} /></button>
      </div>
      
      <div className="cad-viewer-container" ref={containerRef}>
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading 3D model...</p>
          </div>
        ) : error ? (
          <div className="error-overlay">
            <div className="error-icon">!</div>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <Canvas
              ref={canvasRef}
              shadows
              camera={{ position: [0, 0, 10], fov: 50 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Stage environment="city" intensity={0.6}>
                {model && <Model model={model} />}
              </Stage>
              <OrbitControls 
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.1}
                rotateSpeed={0.7}
                zoomSpeed={1.2}
                panSpeed={0.8}
                minDistance={0.5}
                maxDistance={100}
              />
              <ControlsHandler controlsRef={controlsRef} />
              {/* Grid and axes helpers are conditional based on showGrid state */}
              {showGrid && <gridHelper args={[20, 20, 0x888888, 0xcccccc]} />}
              {showGrid && <axesHelper args={[5]} />}
            </Canvas>
            
            {/* Floating controls for fullscreen mode */}
            <div className={`cad-viewer-floating-controls ${isFullscreen ? 'visible' : 'hidden'}`}>
              <Tooltip title="Rotate Model">
                <button 
                  className={`control-button ${activeControl === 'rotate' ? 'active' : ''}`}
                  onClick={toggleRotateControls}
                >
                  <RotateCcw size={20} />
                </button>
              </Tooltip>
              
              {/* Grid rotation controls for fullscreen mode */}
              {isFullscreen && showRotateControls && renderGridRotationControls()}
              
              <Tooltip title="Zoom In">
                <button 
                  className="control-button"
                  onClick={handleZoomIn}
                >
                  <ZoomIn size={20} />
                </button>
              </Tooltip>
              
              <Tooltip title="Zoom Out">
                <button 
                  className="control-button"
                  onClick={handleZoomOut}
                >
                  <ZoomOut size={20} />
                </button>
              </Tooltip>
              
              <Tooltip title="Pan Model">
                <button 
                  className={`control-button ${activeControl === 'pan' ? 'active' : ''}`}
                  onClick={setPanMode}
                >
                  <Move size={20} />
                </button>
              </Tooltip>
              
              <Tooltip title="Reset View">
                <button 
                  className="control-button" 
                  onClick={() => {
                    resetView();
                    resetControlMode();
                  }}
                >
                  <RefreshCw size={20} />
                </button>
              </Tooltip>
              
              <Tooltip title="Export Model">
                <button className="control-button" onClick={exportModel}>
                  <Download size={20} />
                </button>
              </Tooltip>
              
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <button className="control-button" onClick={toggleFullscreen}>
                  <Maximize size={20} />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
      
      {/* Regular controls (visible in normal mode) */}
      <div className="cad-viewer-controls">
        <Tooltip title="Rotate Model">
          <button 
            className={`control-button ${activeControl === 'rotate' ? 'active' : ''}`}
            onClick={toggleRotateControls}
          >
            <RotateCcw size={20} />
          </button>
        </Tooltip>
        
        {/* Horizontal rotation controls for non-fullscreen mode */}
        {!isFullscreen && showRotateControls && renderHorizontalRotationControls()}
        
        <Tooltip title="Zoom In">
          <button 
            className="control-button"
            onClick={handleZoomIn}
          >
            <ZoomIn size={20} />
          </button>
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <button 
            className="control-button"
            onClick={handleZoomOut}
          >
            <ZoomOut size={20} />
          </button>
        </Tooltip>
        
        <Tooltip title="Pan Model">
          <button 
            className={`control-button ${activeControl === 'pan' ? 'active' : ''}`}
            onClick={setPanMode}
          >
            <Move size={20} />
          </button>
        </Tooltip>
        
        <Tooltip title="Reset View">
          <button 
            className="control-button" 
            onClick={() => {
              resetView();
              resetControlMode();
            }}
          >
            <RefreshCw size={20} />
          </button>
        </Tooltip>
        
        <Tooltip title="Toggle Grid">
          <button 
            className={`control-button ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
          >
            #
          </button>
        </Tooltip>
        
        <Tooltip title="Export Model">
          <button className="control-button" onClick={exportModel}>
            <Download size={20} />
          </button>
        </Tooltip>
        
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <button className="control-button" onClick={toggleFullscreen}>
            <Maximize size={20} />
          </button>
        </Tooltip>
      </div>
      
      <div className="cad-viewer-instructions">
        <p>Controls: Left click + drag to rotate | Right click + drag to pan | Scroll to zoom</p>
      </div>
    </div>
  );
};

export default CADViewer;