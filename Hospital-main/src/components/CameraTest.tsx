import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

const CameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeCamera = async () => {
      try {
        addLog('🔄 Starting camera initialization...');
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device');
        }
        
        addLog('✅ getUserMedia is supported');
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        
        addLog('✅ Camera permission granted');
        
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  addLog('✅ Camera stream started successfully');
                  setIsInitialized(true);
                }).catch(err => {
                  addLog(`❌ Error playing video: ${err.message}`);
                });
              }
            };
          }
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          addLog(`❌ Camera initialization failed: ${errorMessage}`);
          
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
              setError('Camera access denied. Please allow camera access and refresh the page.');
            } else if (err.name === 'NotFoundError') {
              setError('No camera found. Please connect a camera and try again.');
            } else if (err.name === 'NotSupportedError') {
              setError('Camera not supported on this device or browser.');
            } else {
              setError('Camera access failed. Please check permissions and try again.');
            }
          } else {
            setError('Camera access failed. Please try again.');
          }
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        addLog('🔄 Camera stream stopped');
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      addLog('❌ Camera not ready for capture');
      setError('Camera not ready. Please wait for camera to initialize.');
      return;
    }

    try {
      addLog('📸 Capturing photo...');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        addLog('❌ Failed to get canvas context');
        setError('Failed to capture photo. Please try again.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      addLog(`📐 Canvas size: ${canvas.width}x${canvas.height}`);

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      addLog('✅ Video frame drawn to canvas');

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setError(null);
      addLog(`✅ Photo captured successfully (${Math.round(imageData.length / 1024)}KB)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`❌ Photo capture error: ${errorMessage}`);
      setError('Failed to capture photo. Please try again.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    addLog('🔄 Retaking photo...');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Camera Test</h1>
            <p className="text-gray-600">Testing camera functionality and debugging issues</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Camera Feed</h2>
              
              {!isInitialized && !error && (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Initializing camera...</p>
                  </div>
                </div>
              )}

              {stream && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Live
                  </div>
                </div>
              )}

              {error && (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                    <p className="text-gray-500">Camera Error</p>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {!capturedImage ? (
                <button
                  onClick={capturePhoto}
                  disabled={!stream || !isInitialized}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capture Photo
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured photo"
                      className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Captured
                    </div>
                  </div>
                  <button
                    onClick={retakePhoto}
                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Retake Photo
                  </button>
                </div>
              )}
            </div>

            {/* Logs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Debug Logs</h2>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Logs
                </button>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Status Summary:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${navigator.mediaDevices ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>getUserMedia Support</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${stream ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Camera Stream</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Initialized</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${capturedImage ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Photo Captured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraTest;
