import { SidebarOption, UserAuthDetails } from "@/lib/types";
import { Company, Unit } from "@prisma/client";
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
  user: UserAuthDetails;
};

const Sidebar = ({ id, type, user }: Props) => {
  if (!user) return null;
  if (!user.companyId) return;

  // Get the details of the company or unit
  const details =
    type === "company"
      ? user.Company
      : type === "unit"
      ? user.Company?.units.find((unit) => unit.id === id)
      : user.Unit?.name; // <-- pour "user", on affiche les infos de l’entreprise

  // Get the logo of the company
  const sideBarLogo = user.Company?.logo || "";

  // Helper function to get sidebar options based on user role and context
  const getSidebarOptions = (): SidebarOption[] => {
    // Company-level navigation (only for OWNER)
    if (type === "company" && user.role === "OWNER") {
      return [
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
    }

    // Unit-level navigation for OWNER and ADMIN
    if (type === "unit" && (user.role === "OWNER" || user.role === "ADMIN")) {
      return [
        {
          id: "1",
          name: "Tableau de Bord",
          icon: <LayoutDashboard />,
          link: `/unite/${id}/dashboard`,
        },
        {
          id: "2",
          name: "Equipe",
          icon: <ShieldUser />,
          link: `/unite/${id}/users`,
        },
        {
          id: "3",
          name: "Projects",
          icon: <FolderOpenDot />,
          link: `/unite/${id}/projects`,
        },
        {
          id: "4",
          name: "Clients",
          icon: <Contact />,
          link: `/unite/${id}/clients`,
        },
        {
          id: "5",
          name: "Tasks",
          icon: <ListTodo />,
          link: `/unite/${id}/tasks`,
        },
        {
          id: "6",
          name: "Productions",
          icon: <Goal />,
          link: `/unite/${id}/productions`,
        },
      ];
    }

    // Default user-level navigation (regular USER role)
    if (type === "user" && user.role === "USER") {
      return [
        {
          id: "1",
          name: "Dashboard",
          icon: <LayoutDashboard />,
          link: `/user/${user.unitId}/dashboard`,
        },
        {
          id: "2",
          name: "Projects",
          icon: <SwatchBook />,
          link: `/user/${user.unitId}/projects`,
        },
        {
          id: "3",
          name: "Tasks",
          icon: <ListTodo />,
          link: `/user/${user.unitId}/tasks`,
        },
      ];
    }
    return [];
  };

  const sideBarOpt = getSidebarOptions();
  const units = user.Company?.units || [];
  return (
    <>
      {/* Desktop sidebar */}
      <MenuOptions
        defaultOpen={true}
        units={units}
        roleSidebarOptions={sideBarOpt}
        sidebarLogo={sideBarLogo}
        details={details as Company | Unit}
        user={user}
        id={id}
      />
      {/* Mobile sidebar */}
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
