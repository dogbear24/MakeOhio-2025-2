// components/WebCamera.tsx
import { Camera, CameraView, CameraCapturedPicture } from 'expo-camera';
import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

import { getCurrentLocation } from './LocationComponent';

export type PhotoLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
} | null;

interface WebCameraProps {
  onPhotoTaken: (photo: string, location: PhotoLocation) => void;
}



// Define CameraType manually if needed
type CameraType = 'front' | 'back';

export default function WebCamera({ onPhotoTaken }: WebCameraProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const capturedPhoto = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      const location = await getCurrentLocation();

      if (capturedPhoto != null) {
        console.log(capturedPhoto.uri);
        setPhoto(capturedPhoto.uri);
        onPhotoTaken(capturedPhoto.uri, location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined, // Convert null to undefined
          timestamp: location.timestamp
        } : null);
        if (location) {
          console.log("Laditude:", location.coords.latitude, "Longitude", location.coords.longitude);
        }
        
      } else {
        console.log('No photo captured');
      }
    } else {
      console.log('Camera ref is null');
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (Platform.OS === 'web') {
        const video = document.querySelector('video');
        if (video) video.play();
      }
    })();
  }, []);

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={cameraType as any} // Temporary type assertion
      >
        
        <TouchableOpacity style={styles.buttonContainer} onPress={takePicture}>
          <View style={styles.bubbleContainer}>
            <Text style={styles.text}>Capture</Text>
          </View>
          
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  text: {
    color: 'white',
  },
  bubbleContainer: {
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});