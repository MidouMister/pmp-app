'use client';

import { useSidebarCollapseContext } from '@/providers/sidebar-collapse-provider';
import React from 'react';

type ResponsiveLayoutWrapperProps = {
  children: React.ReactNode;
};

export default function ResponsiveLayoutWrapper({ children }: ResponsiveLayoutWrapperProps) {
  const { isCollapsed } = useSidebarCollapseContext();

  return (
    <div 
      className={`transition-all duration-300 ${isCollapsed ? 'md:pl-[80px]' : 'md:pl-[300px]'}`}
    >
      {children}
    </div>
  );
}