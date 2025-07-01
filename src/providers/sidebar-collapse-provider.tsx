"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type SidebarCollapseContextType = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setIsCollapsed: (value: boolean) => void;
};

const SidebarCollapseContext = createContext<
  SidebarCollapseContextType | undefined
>(undefined);

export function useSidebarCollapseContext() {
  const context = useContext(SidebarCollapseContext);
  if (context === undefined) {
    throw new Error(
      "useSidebarCollapseContext must be used within a SidebarCollapseProvider"
    );
  }
  return context;
}

type SidebarCollapseProviderProps = {
  children: ReactNode;
  defaultCollapsed?: boolean;
  storageKey?: string;
};

export function SidebarCollapseProvider({
  children,
  defaultCollapsed = false,
  storageKey = "sidebar-collapsed",
}: SidebarCollapseProviderProps) {
  // Initialize state from localStorage or default value
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(storageKey);
      return storedValue !== null ? JSON.parse(storedValue) : defaultCollapsed;
    }
    return defaultCollapsed;
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, storageKey]);

  // Toggle function
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const value = {
    isCollapsed,
    toggleCollapse,
    setIsCollapsed,
  };

  return (
    <SidebarCollapseContext.Provider value={value}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}
