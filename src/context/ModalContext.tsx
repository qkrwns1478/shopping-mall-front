'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CommonModal from '@/components/CommonModal';

interface ModalContextType {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    message: '',
    title: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: () => {},
  });

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const showAlert = useCallback((message: string, title: string = '알림') => {
    setConfig({
      message,
      title,
      type: 'alert',
      onConfirm: () => {},
    });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void, title: string = '확인') => {
    setConfig({
      message,
      title,
      type: 'confirm',
      onConfirm,
    });
    setIsOpen(true);
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <CommonModal
        isOpen={isOpen}
        onClose={close}
        title={config.title}
        message={config.message}
        type={config.type}
        onConfirm={config.onConfirm}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}