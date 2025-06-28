"use client";
import { SidebarOption, UserAuthDetails } from "@/lib/types";
import { Company, Unit } from "@prisma/client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import {
  Building2,
  ChevronLeft,
  ChevronsUpDown,
  Compass,
  Menu,
  PlusCircleIcon,
} from "lucide-react";
import clsx from "clsx";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "../global/custom-model";
import UnitDetails from "../forms/unite-details";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  units: Unit[];
  roleSidebarOptions: SidebarOption[];
  sidebarLogo: string;
  details: Company;
  user: UserAuthDetails;
  id: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobile: boolean;
};

const MenuOptions = ({
  units,
  roleSidebarOptions,
  sidebarLogo,
  details,
  user,
  isCollapsed,
  setIsCollapsed,
  isMobile,
}: Props) => {
  const { setOpen } = useModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const openState = isMobile ? { open: true } : {};

  const sidebarClasses = clsx(
    "fixed top-0 left-0 z-50 flex h-full flex-col bg-background/80 backdrop-blur-xl border-r transition-all duration-300 ease-in-out",
    {
      "w-[70px]": isCollapsed,
      "w-[300px]": !isCollapsed,
    }
  );

  const contentClasses = clsx("flex h-full flex-col p-4", {
    "items-center": isCollapsed,
  });

  const SidebarContent = () => (
    <div className={contentClasses}>
      <div className="flex w-full items-center justify-between">
        {!isCollapsed && (
          <AspectRatio ratio={16 / 5} className="w-full">
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
        )}
        {isCollapsed && (
          <AspectRatio ratio={1 / 1} className="w-10 h-10">
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={clsx(
              "w-full justify-start mt-4 mb-6",
              isCollapsed ? "p-2" : "py-6"
            )}
            variant="ghost"
            disabled={user?.role !== "OWNER"}
          >
            <div className="flex items-center gap-3 text-left w-full">
              <Compass className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col flex-grow min-w-0">
                  <span className="font-medium truncate">{details.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {details.companyAddress}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <ChevronsUpDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command className="rounded-lg">
            <CommandInput placeholder="Chercher..." />
            <CommandList className="max-h-[320px] overflow-auto">
              <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
              {user?.role === "OWNER" && user.Company && (
                <CommandGroup heading="Entreprise">
                  <CommandItem className="p-0 hover:bg-muted">
                    {isMobile ? (
                      <Link
                        href={`/company/${user.Company.id}`}
                        className="flex items-center gap-3 w-full p-2"
                      >
                        <div className="relative h-10 w-10 shrink-0">
                          <Image
                            src={user.Company.logo || "/placeholder.svg"}
                            sizes="(max-width: 40px) 100vw, 40px"
                            alt={`${user.Company.name} Logo`}
                            fill
                            className="rounded-md object-contain"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {user.Company.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.Company.companyAddress}
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href={`/company/${user.Company.id}`}
                        className="flex items-center gap-3 w-full p-2"
                      >
                        <div className="relative h-10 w-10 shrink-0">
                          <Image
                            src={user.Company.logo || "/placeholder.svg"}
                            sizes="(max-width: 40px) 100vw, 40px"
                            alt={`${user.Company.name} Logo`}
                            fill
                            className="rounded-md object-contain"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {user.Company.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.Company.companyAddress}
                          </span>
                        </div>
                      </Link>
                    )}
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup heading="Unités">
                {units.length > 0 ? (
                  units.map((unit) => (
                    <CommandItem key={unit.id} className="p-0 hover:bg-muted">
                      {isMobile ? (
                        <Link
                          href={`/unite/${unit.id}`}
                          className="flex items-center gap-3 w-full p-2"
                        >
                          <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">
                              {unit.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {unit.address}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <Link
                          href={`/unite/${unit.id}`}
                          className="flex items-center gap-3 w-full p-2"
                        >
                          <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">
                              {unit.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {unit.address}
                            </span>
                          </div>
                        </Link>
                      )}
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled>Aucune unité disponible</CommandItem>
                )}
              </CommandGroup>
            </CommandList>
            {user?.role === "OWNER" && (
              <div className="p-2 border-t">
                <Button
                  className="w-full flex items-center gap-2"
                  size="sm"
                  onClick={() =>
                    setOpen(
                      <CustomModal
                        title="Ajouter Unité"
                        subheading="Ajouter une nouvelle Unité à votre entreprise."
                      >
                        <UnitDetails
                          companyDetails={user?.Company as Company}
                          userName={user?.name}
                        />
                      </CustomModal>
                    )
                  }
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  {!isCollapsed && <span>Ajouter Unité</span>}
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <TooltipProvider>
        <p
          className={clsx(
            "text-muted-foreground text-xs mb-2 transition-opacity duration-300",
            { "opacity-0": isCollapsed, "opacity-100": !isCollapsed }
          )}
        >
          {!isCollapsed && "Menu Links"}
        </p>
        <Separator className="mb-4" />
        <nav className="relative">
          <Command className="rounded-lg overflow-visible bg-transparent">
            {!isCollapsed && (
              <CommandInput placeholder="Recherche..." className="mb-2" />
            )}
            <CommandList className="py-2 overflow-visible">
              <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
              <CommandGroup className="overflow-visible">
                {roleSidebarOptions.map((option) => (
                  <Tooltip key={option.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <CommandItem className="p-0">
                        <Link
                          href={option.link}
                          className={clsx(
                            "flex items-center gap-4 w-full p-3 rounded-md transition-all duration-200",
                            {
                              "bg-primary text-primary-foreground": false, // Add active link logic here
                              "hover:bg-muted": true,
                              "justify-center": isCollapsed,
                            }
                          )}
                        >
                          {option.icon}
                          {!isCollapsed && (
                            <span className="font-medium text-sm">
                              {option.name}
                            </span>
                          )}
                        </Link>
                      </CommandItem>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent
                        side="right"
                        className="bg-background/90 backdrop-blur-xl p-2"
                      >
                        <p>{option.name}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </nav>
      </TooltipProvider>
      <div
        className={clsx(
          "absolute right-[-16px] top-1/2 transform -translate-y-1/2",
          { hidden: isMobile }
        )}
      >
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="icon"
          className="rounded-full bg-background/80 backdrop-blur-xl hover:bg-muted"
        >
          <ChevronLeft
            className={clsx(
              "h-5 w-5 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet modal={false} {...openState}>
        <SheetTrigger asChild className="absolute left-4 top-4 z-[100]">
          <Button variant="outline" size={"icon"}>
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          showX={true}
          side={"left"}
          className="w-full p-0 border-none"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return <div className={sidebarClasses}>{SidebarContent()}</div>;
};

export default MenuOptions;
