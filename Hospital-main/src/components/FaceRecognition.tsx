import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, User, Search } from 'lucide-react';

interface FaceRecognitionProps {
  onFaceDetected: (faceData: string) => void;
  onClose: () => void;
  mode: 'registration' | 'search';
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onFaceDetected, onClose, mode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeCamera = async () => {
      try {
        await startCamera();
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize camera. Please check permissions and try again.');
          console.error('Camera initialization error:', err);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      initializeCamera();
    }, 100);

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      console.log('🎥 Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('✅ Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      
      // Wait for video element to be ready
      const setupVideo = () => {
        if (videoRef.current && mediaStream) {
          console.log('📹 Setting up video element...');
          videoRef.current.srcObject = mediaStream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('📹 Video metadata loaded, starting playback...');
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => console.log('✅ Video playing successfully'))
                .catch(err => console.error('❌ Video play failed:', err));
            }
          };
          
          videoRef.current.oncanplay = () => {
            console.log('📹 Video can play');
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => console.log('✅ Video playing after canplay'))
                .catch(err => console.error('❌ Video play failed after canplay:', err));
            }
          };
        }
      };
      
      // Setup video immediately and also after a delay
      setupVideo();
      setTimeout(setupVideo, 200);
      setTimeout(setupVideo, 500);
      
    } catch (err) {
      console.error('❌ Camera access error:', err);
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
      throw err;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please wait for camera to initialize.');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        setError('Failed to capture photo. Please try again.');
        return;
      }

      // Check if video is ready and has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Video not ready. Please wait for camera to fully load.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add a small delay to ensure the frame is properly rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to base64 with higher quality
      let imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      // If JPEG is too small (likely corrupted), try PNG
      if (imageData.length < 1000) {
        console.log('⚠️ JPEG too small, trying PNG...');
        imageData = canvas.toDataURL('image/png');
      }
      
      console.log('📸 Captured image data length:', imageData.length);
      console.log('📸 Image data preview:', imageData.substring(0, 50) + '...');
      console.log('📸 Canvas dimensions:', canvas.width, 'x', canvas.height);
      console.log('📸 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      setCapturedImage(imageData);
      setIsCapturing(true);
      setError(null);
    } catch (err) {
      console.error('Photo capture error:', err);
      setError('Failed to capture photo. Please try again.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    setError(null);
  };

  const processFace = async () => {
    if (!capturedImage) {
      setError('No image captured. Please capture a photo first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate face processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would:
      // 1. Send the image to a face recognition API
      // 2. Extract face features/embeddings
      // 3. Compare with stored face data
      // 4. Return match results

      // For demo purposes, we'll simulate face detection
      const faceDetected = Math.random() > 0.3; // 70% chance of detecting a face

      if (faceDetected) {
        onFaceDetected(capturedImage);
      } else {
        setError('No face detected in the image. Please ensure your face is clearly visible and try again.');
      }
    } catch (err) {
      console.error('Face processing error:', err);
      setError('Face processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopCamera = () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
    onClose();
  };

  // Show loading state while initializing
  if (!isInitialized && !error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Initializing Camera</h2>
          <p className="text-gray-600">Please wait while we set up your camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg mr-4">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'registration' ? 'Capture Patient Photo' : 'Face Recognition Search'}
              </h2>
              <p className="text-gray-600">
                {mode === 'registration' 
                  ? 'Take a clear photo of the patient for future identification'
                  : 'Capture patient face to search medical records'
                }
              </p>
            </div>
          </div>
          <button
            onClick={stopCamera}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {!capturedImage ? (
            <div className="relative">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 mb-4">Camera not available</p>
                    <button
                      onClick={startCamera}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Start Camera
                    </button>
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  disabled={!stream || !isInitialized}
                  className="bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-8 w-8 text-blue-600" />
                </button>
              </div>

              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {stream ? 'Live Camera' : 'Camera Offline'}
              </div>
              {stream && videoRef.current && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Camera Active
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured photo"
                  className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Captured
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <X className="h-5 w-5 mr-2" />
                  Retake Photo
                </button>
                <button
                  onClick={processFace}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === 'registration' ? (
                        <>
                          <User className="h-5 w-5 mr-2" />
                          Save Photo
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Search Face
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure good lighting and clear visibility of the face</li>
              <li>• Look directly at the camera</li>
              <li>• Remove glasses, hats, or face coverings if possible</li>
              <li>• Keep the face centered in the frame</li>
              {mode === 'search' && (
                <li>• The system will search for matching faces in the database</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;
