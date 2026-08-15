import { useState, useCallback } from 'react';
import type { AlertType } from '@/components/AppAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons: AlertButton[];
}

export function useAppAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback((
    title: string,
    message: string,
    options?: { type?: AlertType; buttons?: AlertButton[] }
  ) => {
    setAlertState({
      visible: true,
      type: options?.type || 'info',
      title,
      message,
      buttons: options?.buttons || [],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  return { alertState, showAlert, hideAlert };
}
