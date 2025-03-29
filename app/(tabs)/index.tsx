import { Image, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';
import * as FileSystem from 'expo-file-system';


import WebCamera, { PhotoLocation } from '@/components/WebCamera';
import { LocationDisplay, useLocation } from '@/components/LocationComponent';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { View, Button } from 'react-native';
import {ChatComponent} from '@/components/ChatComponent';


export default function HomeScreen() {


  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState([]);

  const { location, error: locationError, getLocation } = useLocation();


  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Recording | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);

  const sendRecording = async (uri: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // // Send via WebSocket
        // wsRef.current?.sendMessage({
        //   type: 'audio',
        //   data: fileContent,
        //   format: 'base64'
        // });
      }
    } catch (error) {
      console.log('File read error:', error);
    }
  };

  const handlePhotoTaken = (photoUri: string, location: PhotoLocation) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'photo',
        data: {
          image: photoUri,
          location: location
        }
      }));
    }
  };

  const startRecording = async () => {
    try {

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
  
      // Store recording in both ref and state
      recordingRef.current = newRecording;
      setIsRecording(true);
  
      // Set auto-stop timer
      timeoutRef.current = setTimeout(async () => {
        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            console.log('Auto-stopped recording at:', uri);
          }
        } catch (error) {
          console.log('Auto-stop error:', error);
        } finally {
          // Reset state regardless of success
          recordingRef.current = null;
          setIsRecording(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }
      }, 10000);
  
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        console.log('Manually stopped recording at:', uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      // Clear references and state
      recordingRef.current = null;
      setIsRecording(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Stop recording only if it exists and hasn't been stopped
      if (recording) {
        console.log('Cleaning up recording...');
        recording.stopAndUnloadAsync().catch(error => {
          console.log('Cleanup error:', error);
        });
      }
    };
  }, [recording]);



  useEffect(() => { 
    // Connect to the WebSocket server
    const socket = new WebSocket('ws://localhost:8765');
    
    socket.onopen = () => {
      console.log('Connected to WebSocket');
      // You can send a text message once the connection is open.
      const message = {
        type: 'text',
        data: 'Hello from React Native!'
      };
      socket.send(JSON.stringify(message));
    };

    socket.onmessage = (e) => {
      // Message received from the server.
      console.log('Received:', e.data);
      const msgObj = JSON.parse(e.data);
      //setMessages(prev => [...prev, msgObj]);
    };

    socket.onerror = (e) => {
      console.log('WebSocket error:', e);
    };

    socket.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
    };

    setWs(socket);

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome! Hello My name is Jason</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/*Add Camera Section*/}
      <ThemedView style={styles.cameraContainer}>
        <ThemedText type="subtitle">Camera Preview</ThemedText>
        <WebCamera onPhotoTaken={handlePhotoTaken} />
      </ThemedView>
      <ChatComponent></ChatComponent>
      

      <ThemedView style={styles.cameraContainer}>
        <ThemedText type="subtitle">Audio Recording</ThemedText>
        <Button 
          title={isRecording ? 'Stop Recording' : 'Start Recording'} 
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isRecording}
        />
        {isRecording && (
          <ThemedText style={{ color: 'red', marginTop: 8 }}>
            Recording... (auto-stops in 10 seconds)
          </ThemedText>
        )}
      </ThemedView>


  


    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  cameraContainer: {
    height: 1000,
    marginBottom: 8,
  },
});
