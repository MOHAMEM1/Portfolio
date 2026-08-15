import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { BASE_URL } from '@/config/api';

// Convert http:// to ws://
const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

type WebSocketContextType = {
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType>({ isConnected: false });

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!username) {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      setIsConnected(false);
      return;
    }

    const connectWS = () => {
      const wsUrl = `${WS_BASE_URL}/ws/notifications/${username}`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        // Notification reçue en temps réel
        const message = event.data;
        Alert.alert("🔔 Notification XAALISI", message);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        // Reconnexion automatique après 5 secondes
        setTimeout(() => {
          if (username) connectWS();
        }, 5000);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current = websocket;
    };

    connectWS();

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [username]);

  return (
    <WebSocketContext.Provider value={{ isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
