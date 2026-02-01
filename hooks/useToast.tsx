import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import Toast from 'react-native-toast-message';

type ToastContextType = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showSuccess = useCallback((message: string) => {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  }, []);

  const showError = useCallback((message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  }, []);

  const hide = useCallback(() => {
    Toast.hide();
  }, []);

  const contextValue: ToastContextType = { showSuccess, showError, showInfo, hide };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
