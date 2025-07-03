import { getAuthUserDetails } from "@/lib/queries";

import { SidebarOption } from "@/lib/types";
import { Company } from "@prisma/client";
import {
  Boxes,
  ClipboardIcon,
  Contact,
  CreditCard,
  FolderOpenDot,
  Goal,
  LayoutDashboard,
  ListTodo,
  Settings,
  ShieldUser,
  SwatchBook,
} from "lucide-react";
import { MenuOptions } from "./menu-options";

type Props = {
  id: string;
  type: "company" | "unit" | "user";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null;
  if (!user.companyId) return;

  // get the details of the company and there units
  const details =
    type === "company"
      ? user.Company
      : user.Company?.units.find((unit) => unit.id === id);

  if (!details) return null;

  // get the logo of the company
  const sideBarLogo = user.Company?.logo || "";
  console.log(sideBarLogo);
  const ownerSidebarOptions: SidebarOption[] = [
    {
      id: "1",
      name: "Tableau de Bord",
      icon: <LayoutDashboard />,
      link: `/company/${user.companyId}`,
    },
    {
      id: "2",
      name: "Commencer",
      icon: <ClipboardIcon />,
      link: `/company/${user.companyId}/launchpad`,
    },
    {
      id: "3",
      name: "Paiment",
      icon: <CreditCard />,
      link: `/company/${user.companyId}/billing`,
    },
    {
      id: "4",
      name: "Paramètres",
      icon: <Settings />,
      link: `/company/${user.companyId}/settings`,
    },
    {
      id: "5",
      name: "Unités",
      icon: <Boxes />,
      link: `/company/${user.companyId}/units`,
    },
    {
      id: "6",
      name: "Equipes",
      icon: <ShieldUser />,
      link: `/company/${user.companyId}/team`,
    },
  ];

  const adminSidebarOptions: SidebarOption[] = [
    {
      id: "1",
      name: "Tableau de Bord",
      icon: <LayoutDashboard />,
      link: `/unite/${details.id}/dashboard`,
    },
    {
      id: "2",
      name: "Equipe",
      icon: <ShieldUser />,
      link: `/unite/${details.id}/users`,
    },
    {
      id: "3",
      name: "Projects",
      icon: <FolderOpenDot />,
      link: `/unite/${details.id}/projects`,
    },
    {
      id: "4",
      name: "Clients",
      icon: <Contact />,
      link: `/unite/${details.id}/clients`,
    },
    {
      id: "5",
      name: "Tasks",
      icon: <ListTodo />,
      link: `/unite/${details.id}/tasks`,
    },
    {
      id: "6",
      name: "Productions",
      icon: <Goal />,
      link: `/unite/${details.id}/productions`,
    },
  ];

  const userSidebarOptions: SidebarOption[] = [
    {
      id: "1",
      name: "Dashboard",
      icon: <LayoutDashboard />,
      link: `/unite/${user.unitId}/dashboard`,
    },
    {
      id: "2",
      name: "Projects",
      icon: <SwatchBook />,
      link: `/unite/${user.unitId}/projects`,
    },
    {
      id: "3",
      name: "Tasks",
      icon: <ListTodo />,
      link: `/unite/${user.unitId}/tasks`,
    },
  ];
  const sideBarOpt =
    type === "company"
      ? ownerSidebarOptions
      : type === "unit"
      ? adminSidebarOptions
      : userSidebarOptions;
  // New logic based on user role
  const units = user.Company?.units || [];

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        units={units}
        roleSidebarOptions={sideBarOpt}
        sidebarLogo={sideBarLogo}
        details={details as Company}
        user={user}
        id={id}
      />
      {/* mobile nav bar */}
      <MenuOptions
        units={units}
        roleSidebarOptions={sideBarOpt}
        sidebarLogo={sideBarLogo}
        details={details as Company}
        user={user}
        id={id}
      />
    </>
  );
};

export default Sidebar;
