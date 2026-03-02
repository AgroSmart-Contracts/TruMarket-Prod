import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextProps {
  modalOpen: boolean;
  openModal: (modalView?: any) => void;
  closeModal: () => void;
  setModalView: React.Dispatch<any>;
  modalView: any;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<any>();

  const openModal = (modalView?: any) => {
    setModalOpen(true);
    if (modalView !== null) {
      setModalView(modalView);
    }
  };
  const closeModal = () => setModalOpen(false);

  return (
    <ModalContext.Provider value={{ modalOpen, openModal, closeModal, setModalView, modalView }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
