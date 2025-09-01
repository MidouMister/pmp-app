"use client";

import { TaskDetails } from "@/lib/types";
import { Client, Company, GanttMarker, Phase, User } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalData = {
  user?: User;
  company?: Company;
  task?: TaskDetails[0];
  client?: Client;
  phase?: Phase;
  marker?: GanttMarker;
};

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  activeModalId: string | null;
  setOpen: (
    modalId: string,
    modal: React.ReactNode,
    fetchData?: () => Promise<ModalData>
  ) => void;
  setClose: () => void;
  isModalOpen: (modalId: string) => boolean;
};

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  activeModalId: null,
  setOpen: () => {},
  setClose: () => {},
  isModalOpen: () => false,
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen = async (
    modalId: string,
    modal: React.ReactNode,
    fetchData?: () => Promise<ModalData>
  ) => {
    if (modal && modalId) {
      if (fetchData) {
        setData({ ...data, ...(await fetchData()) });
      }
      setActiveModalId(modalId);
      setShowingModal(modal);
      setIsOpen(true);
    }
  };

  const setClose = () => {
    setIsOpen(false);
    setActiveModalId(null);
    setData({});
    setShowingModal(null);
  };

  const isModalOpen = (modalId: string) => {
    return isOpen && activeModalId === modalId;
  };

  if (!isMounted) return null;

  return (
    <ModalContext.Provider
      value={{
        data,
        setOpen,
        setClose,
        isOpen,
        activeModalId,
        isModalOpen,
      }}
    >
      {children}
      {showingModal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within the modal provider");
  }
  return context;
};

export default ModalProvider;
