"use client";

import { useState } from "react";
import MenuOptions from "./menu-options";
import { SidebarOption, UserAuthDetails } from "@/lib/types";
import { Company, Unit } from "@prisma/client";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";

type Props = {
  units: Unit[];
  roleSidebarOptions: SidebarOption[];
  sidebarLogo: string;
  details: Company;
  user: UserAuthDetails;
  id: string;
  defaultOpen?: boolean;
};

const SidebarWrapper = (props: Props) => {
  const isMobile = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <MenuOptions
      {...props}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isMobile={isMobile}
    />
  );
};

export default SidebarWrapper;
