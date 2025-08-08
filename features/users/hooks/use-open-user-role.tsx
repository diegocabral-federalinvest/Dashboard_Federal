"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ModalState {
  isOpen: boolean;
  userId: string | null;
}

interface UseOpenUserRole {
  isOpen: boolean;
  userId: string | null;
  onOpen: (userId: string) => void;
  onClose: () => void;
}

const initialState: ModalState = {
  isOpen: false,
  userId: null,
};

// Context
const UserRoleModalContext = createContext<UseOpenUserRole | undefined>(undefined);

// Provider
export const UserRoleModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const onOpen = useCallback((userId: string) => {

    setModalState({
      isOpen: true,
      userId,
    });
  }, []);

  const onClose = useCallback(() => {

    setModalState({
      isOpen: false,
      userId: null,
    });
  }, []);

  return (
    <UserRoleModalContext.Provider
      value={{
        isOpen: modalState.isOpen,
        userId: modalState.userId,
        onOpen,
        onClose,
      }}
    >
      {children}
    </UserRoleModalContext.Provider>
  );
};

// Hook
export const useOpenUserRole = (): UseOpenUserRole => {
  const context = useContext(UserRoleModalContext);
  if (context === undefined) {
    throw new Error('useOpenUserRole must be used within a UserRoleModalProvider');
  }
  return context;
}; 