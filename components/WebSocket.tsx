import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text } from 'react-native';

export type WebSocketComponentRef = {
  sendMessage: (msg: string) => void;
};

const WebSocketComponent = forwardRef<WebSocketComponentRef>((props, ref) => {
  const ws = useRef<WebSocket | null>(null);
  const [receivedMessage, setReceivedMessage] = useState<string>('');

  useEffect(() => {
    // Make sure to adjust the URL if you’re running on a device/emulator
    ws.current = new WebSocket('ws://localhost:1234');

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.current.onmessage = (e) => {
      console.log('Message received from server:', e.data);
      setReceivedMessage(e.data);
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
    };

    // Cleanup when component unmounts
    return () => {
      ws.current?.close();
    };
  }, []);

  // Expose sendMessage method to parent via ref
  useImperativeHandle(ref, () => ({
    sendMessage: (msg: string) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(msg);
        console.log('Sent message:', msg);
      } else {
        console.log('WebSocket not open. Message not sent.');
      }
    },
  }));

  return (
    <View style={{ padding: 20 }}>
      <Text>Received: {receivedMessage}</Text>
    </View>
  );
});

export default WebSocketComponent;