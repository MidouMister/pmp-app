"use client";

import { useState } from "react";
import { SidebarOption, UserAuthDetails } from "@/lib/types";
import { Company, Unit } from "@prisma/client";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import { MenuOptions } from "./menu-options";

type Props = {
  units: Unit[];
  roleSidebarOptions: SidebarOption[];
  sidebarLogo: string;
  details: Company;
  user: UserAuthDetails;
  id: string;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobile?: boolean;
};

const SidebarWrapper = (props: Props) => {
  const isMobile = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <MenuOptions
      {...props}
      isCollapsed={props.isCollapsed || isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isMobile={isMobile}
    />
  );
};

export default SidebarWrapper;
