"use client";
import { SidebarOption, UserAuthDetails } from "@/lib/types";
import { Company, Unit } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import {
  Building2,
  ChevronsUpDown,
  Compass,
  Menu,
  PlusCircleIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Crown,
} from "lucide-react";
import { useSidebarCollapseContext } from "@/providers/sidebar-collapse-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import clsx from "clsx";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "../global/custom-model";
import UnitDetails from "../forms/unite-details";

type Props = {
  defaultOpen?: boolean;
  units: Unit[];
  roleSidebarOptions: SidebarOption[];
  sidebarLogo: string;
  details: Company;
  user: UserAuthDetails;
  id: string;
};

const MenuOptions = ({
  defaultOpen,
  units,
  roleSidebarOptions,
  sidebarLogo,
  details,
  user,
}: Props) => {
  const pathname = usePathname();

  // Function to determine if a link is active
  const isActive = (linkPath: string) => {
    if (linkPath === pathname) return true;
    if (pathname.startsWith(linkPath) && linkPath !== "/") return true;
    return false;
  };

  const { setOpen } = useModal();
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );
  const [isMounted, setIsMounted] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebarCollapseContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:hidden flex"
      >
        <Button variant="outline" size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side={"left"}
        className={clsx(
          "bg-background/95 backdrop-blur-xl fixed top-0 border-r border-border/20 p-0 transition-all duration-300 ease-in-out flex flex-col",
          {
            "hidden md:flex z-0": defaultOpen,
            "flex md:hidden z-[100] w-full": !defaultOpen,
            "w-[300px]": defaultOpen && !isCollapsed,
            "w-[80px]": defaultOpen && isCollapsed,
          }
        )}
      >
        {/* Toggle Button - Desktop only */}
        {defaultOpen && (
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-10 transform -translate-y-1/2 
                     bg-accent text-accent-foreground rounded-full p-1.5
                     shadow-md hover:shadow-lg transition-all duration-200 
                     hover:bg-accent z-10 hidden md:flex items-center justify-center"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground " />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}

        <SheetTitle
          className={isCollapsed && defaultOpen ? "sr-only" : "sr-only"}
        >
          Navigation Menu
        </SheetTitle>

        {/* Header Section */}
        <div
          className={clsx("p-6 border-b border-border/10", {
            "px-3": isCollapsed && defaultOpen,
          })}
        >
          {/* Logo */}
          <div className="mb-6">
            <AspectRatio
              ratio={isCollapsed && defaultOpen ? 1 : 16 / 5}
              className="transition-all duration-300 rounded-lg overflow-hidden"
            >
              <div className="relative w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <Image
                  src={sidebarLogo}
                  alt="Logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
            </AspectRatio>
          </div>

          {/* Company Selector */}
          <Popover>
            <TooltipProvider
              delayDuration={isCollapsed && defaultOpen ? 100 : 1000}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      className={clsx(
                        "transition-all duration-300 bg-transparent hover:bg-accent/50 border-0 p-0 h-auto justify-start font-normal",
                        {
                          "w-full": !isCollapsed || !defaultOpen,
                          "w-12 h-12 justify-center":
                            isCollapsed && defaultOpen,
                        }
                      )}
                      variant="ghost"
                      disabled={user?.role !== "OWNER"}
                    >
                      <div
                        className={clsx(
                          "flex items-center transition-all duration-300",
                          {
                            "gap-3 p-3 rounded-lg":
                              !isCollapsed || !defaultOpen,
                            "p-0": isCollapsed && defaultOpen,
                          }
                        )}
                      >
                        <div className="relative h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                          <Compass className="h-4 w-4 text-primary" />
                        </div>
                        {(!isCollapsed || !defaultOpen) && (
                          <>
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                              <span className="text-sm font-medium text-foreground truncate">
                                {details.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {details.companyAddress}
                              </span>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          </>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                {isCollapsed && defaultOpen && (
                  <TooltipContent
                    side="right"
                    className="bg-background border border-border/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{details.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {details.companyAddress}
                      </p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <PopoverContent
              className="w-80 p-0 border border-border/50"
              align="start"
            >
              <Command className="rounded-lg">
                <CommandList className="max-h-[320px] overflow-auto custom-scrollbar">
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    Aucun résultat trouvé
                  </CommandEmpty>

                  {user?.role === "OWNER" && user.Company && (
                    <CommandGroup heading="Entreprise">
                      <CommandItem className="p-0">
                        {defaultOpen ? (
                          <Link
                            href={`/company/${user.Company.id}`}
                            className={clsx(
                              "flex items-center gap-3 w-full p-3 rounded-md transition-all duration-200",
                              {
                                "bg-accent": isActive(
                                  `/company/${user.Company.id}`
                                ),
                                "hover:bg-accent/50": !isActive(
                                  `/company/${user.Company.id}`
                                ),
                              }
                            )}
                          >
                            <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted">
                              <Image
                                src={user.Company.logo || "/placeholder.svg"}
                                alt={`${user.Company.name} Logo`}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm truncate">
                                {user.Company.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {user.Company.companyAddress}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/company/${user.Company.id}`}
                              className={clsx(
                                "flex items-center gap-3 w-full p-3 rounded-md transition-all duration-200",
                                {
                                  "bg-accent": isActive(
                                    `/company/${user.Company.id}`
                                  ),
                                  "hover:bg-accent/50": !isActive(
                                    `/company/${user.Company.id}`
                                  ),
                                }
                              )}
                            >
                              <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted">
                                <Image
                                  src={user.Company.logo || "/placeholder.svg"}
                                  alt={`${user.Company.name} Logo`}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-sm truncate">
                                  {user.Company.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {user.Company.companyAddress}
                                </span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}

                  <CommandGroup heading="Unités">
                    {units.length > 0 ? (
                      units.map((unit) => (
                        <CommandItem key={unit.id} className="p-0">
                          {defaultOpen ? (
                            <Link
                              href={`/unite/${unit.id}`}
                              className={clsx(
                                "flex items-center gap-3 w-full p-3 rounded-md transition-all duration-200",
                                {
                                  "bg-accent": isActive(`/unite/${unit.id}`),
                                  "hover:bg-accent/50": !isActive(
                                    `/unite/${unit.id}`
                                  ),
                                }
                              )}
                            >
                              <div className="h-10 w-10 flex items-center justify-center shrink-0 rounded-md bg-muted">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-sm truncate">
                                  {unit.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {unit.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/unite/${unit.id}`}
                                className={clsx(
                                  "flex items-center gap-3 w-full p-3 rounded-md transition-all duration-200",
                                  {
                                    "bg-accent": isActive(`/unite/${unit.id}`),
                                    "hover:bg-accent/50": !isActive(
                                      `/unite/${unit.id}`
                                    ),
                                  }
                                )}
                              >
                                <div className="h-10 w-10 flex items-center justify-center shrink-0 rounded-md bg-muted">
                                  <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-sm truncate">
                                    {unit.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {unit.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem
                        disabled
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        Aucune unité disponible
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>

                {user?.role === "OWNER" && (
                  <div className="p-3 border-t border-border/20">
                    <SheetClose asChild>
                      <Button
                        className="w-full h-10 gap-2 text-sm"
                        variant="outline"
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
                        Ajouter Unité
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col">
          {(!isCollapsed || !defaultOpen) && (
            <div className="px-6 py-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Navigation
              </h3>
            </div>
          )}

          <nav
            className={clsx("flex-1", {
              "px-6": !isCollapsed || !defaultOpen,
              "px-3": isCollapsed && defaultOpen,
            })}
          >
            {!isCollapsed || !defaultOpen ? (
              <div className="space-y-1">
                {roleSidebarOptions.map((option) => (
                  <Link
                    key={option.id}
                    href={option.link}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      {
                        "bg-accent text-accent-foreground": isActive(
                          option.link
                        ),
                        "hover:bg-accent/50 text-muted-foreground hover:text-foreground":
                          !isActive(option.link),
                      }
                    )}
                  >
                    <div
                      className={clsx("transition-colors duration-200", {
                        "text-accent-foreground": isActive(option.link),
                        "text-muted-foreground group-hover:text-foreground":
                          !isActive(option.link),
                      })}
                    >
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium">{option.name}</span>
                    {isActive(option.link) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 pt-4">
                {roleSidebarOptions.map((option) => (
                  <TooltipProvider key={option.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={option.link}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={clsx(
                              "w-12 h-12 relative transition-all duration-200",
                              {
                                "bg-accent text-accent-foreground": isActive(
                                  option.link
                                ),
                                "hover:bg-accent/50": !isActive(option.link),
                              }
                            )}
                          >
                            {option.icon}
                            {isActive(option.link) && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-accent-foreground rounded-full" />
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-background border border-border/50"
                      >
                        <p className="text-sm">{option.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </nav>

          {/* Add Unit Button for Collapsed State */}
          {isCollapsed && defaultOpen && user?.role === "OWNER" && (
            <div className="px-3 pb-4">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-12 h-12"
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
                      <PlusCircleIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-background border border-border/50"
                  >
                    <p className="text-sm">Ajouter Unité</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div
          className={clsx("border-t border-border/10 bg-muted/20", {
            "p-6": !isCollapsed || !defaultOpen,
            "p-3": isCollapsed && defaultOpen,
          })}
        >
          {!isCollapsed || !defaultOpen ? (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || "Utilisateur"}
                  </p>
                  {user?.role === "OWNER" && (
                    <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === "OWNER"
                    ? "Propriétaire"
                    : user?.role || "Utilisateur"}
                </p>
              </div>
            </div>
          ) : (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      {user?.role === "OWNER" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                          <Crown className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-background border border-border/50"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === "OWNER"
                        ? "Propriétaire"
                        : user?.role || "Utilisateur"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
