import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

export function ChatComponent() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
   
    const socket = new WebSocket('ws://localhost:8765');

    socket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    socket.onmessage = (e) => {
      console.log('Received:', e.data);
      try {
        const msgObj = JSON.parse(e.data);
        setMessages((prev) => [...prev, msgObj]);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    socket.onerror = (e) => {
      console.log('WebSocket error:', e);
    };

    socket.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
    };

    setWs(socket);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'text',
        data: input,
      };
      ws.send(JSON.stringify(message));
      setInput('');
    } else {
      console.log('WebSocket is not open yet.');
    }
  };

  return (
    <View style={styles.bubbleContainer}>
      <Text style={styles.header}>Ask for Help</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        value={input}
        onChangeText={setInput}
      />
      <Button title="Send Message" onPress={sendMessage} />
      <View style={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <Text key={idx} style={styles.messageText}>
            {msg.type}: {msg.data}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  header: { fontSize: 20, marginBottom: 10, color: 'white' },
  input: { borderWidth: 1, padding: 5, marginBottom: 10, color: 'white' },
  messagesContainer: { marginTop: 20, color: 'white' },
  messageText: { marginVertical: 2, color: 'white' },
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
