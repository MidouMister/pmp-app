"use client";
import { SidebarOption, UserAuthDetails } from "@/lib/types";
import { Company, Unit } from "@prisma/client";
import { useEffect, useMemo, useState, Dispatch, SetStateAction } from "react";
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
  isCollapsed?: boolean;
  setIsCollapsed?: Dispatch<SetStateAction<boolean>>;
  isMobile?: boolean;
};

export const MenuOptions = ({
  defaultOpen,
  units,
  roleSidebarOptions,
  sidebarLogo,
  details,
  user,
  isCollapsed: propIsCollapsed,
}: Props) => {
  const pathname = usePathname();

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

  const { isCollapsed: contextIsCollapsed, toggleCollapse } =
    useSidebarCollapseContext();
  const isCollapsed = propIsCollapsed ?? contextIsCollapsed;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="fixed left-4 top-4 z-[100] md:hidden">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side="left"
        className={clsx(
          "bg-background border-r border-border/40 p-0 transition-all duration-200 ease-in-out flex flex-col",
          {
            "hidden md:flex z-0": defaultOpen,
            "flex md:hidden z-[100] w-full": !defaultOpen,
            "w-56": defaultOpen && !isCollapsed,
            "w-14": defaultOpen && isCollapsed,
          }
        )}
      >
        {/* Toggle Button */}
        {defaultOpen && (
          <button
            onClick={toggleCollapse}
            className="absolute right-1 top-27 bg-background border border-border rounded-full p-1 
                     shadow-sm hover:shadow-md transition-all duration-200 hover:bg-accent z-10 
                     hidden md:flex items-center justify-center"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        )}

        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Header */}
        <div
          className={clsx("p-3 border-b border-border/20", {
            "px-1.5": isCollapsed && defaultOpen,
          })}
        >
          {/* Logo */}
          <div className="mb-4">
            <AspectRatio
              ratio={isCollapsed && defaultOpen ? 1 : 16 / 6}
              className="transition-all duration-300 rounded-md overflow-hidden"
            >
              <div className="relative w-full h-full bg-muted/30 border border-border/20 rounded-lg p-2">
                <Image
                  src={sidebarLogo}
                  alt="Logo"
                  fill
                  className=" object-cover p-1 rounded-lg"
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
                        "transition-all duration-200 bg-transparent hover:bg-accent/50 border-0 p-0 h-auto font-normal",
                        {
                          "w-full": !isCollapsed || !defaultOpen,
                          "w-9 h-9 justify-center": isCollapsed && defaultOpen,
                        }
                      )}
                      variant="ghost"
                      disabled={user?.role !== "OWNER"}
                    >
                      <div
                        className={clsx(
                          "flex items-center transition-all duration-200",
                          {
                            "gap-1.5 p-1.5 rounded-md":
                              !isCollapsed || !defaultOpen,
                            "p-0": isCollapsed && defaultOpen,
                          }
                        )}
                      >
                        <div className="h-6 w-6 shrink-0 rounded-sm bg-primary/10 flex items-center justify-center p-1">
                          <Compass className="h-3 w-3 text-primary" />
                        </div>
                        {(!isCollapsed || !defaultOpen) && (
                          <>
                            <div className="flex flex-col flex-1 min-w-0 text-left">
                              <span className="text-xs font-medium text-foreground truncate">
                                {details.name}
                              </span>
                            </div>
                            <ChevronsUpDown className="h-3 w-3 text-muted-foreground shrink-0" />
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
                      <p className="font-medium text-xs">{details.name}</p>
                      <p className="text-xs text-muted-foreground opacity-70">
                        {details.companyAddress}
                      </p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <PopoverContent
              className="w-72 p-0 border border-border/50"
              align="start"
            >
              <Command className="rounded-md">
                <CommandList className="max-h-80 overflow-auto">
                  <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                    Aucun résultat trouvé
                  </CommandEmpty>

                  {user?.role === "OWNER" && user.Company && (
                    <CommandGroup heading="Entreprise">
                      <CommandItem className="p-0">
                        {defaultOpen ? (
                          <Link
                            href={`/company/${user.Company.id}`}
                            className={clsx(
                              "flex items-center gap-2 w-full p-2 rounded-sm transition-all duration-200",
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
                            <div className="relative h-8 w-8 shrink-0 rounded-sm overflow-hidden bg-muted">
                              <Image
                                src={user.Company.logo || "/placeholder.svg"}
                                alt={`${user.Company.name} Logo`}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-xs truncate">
                                {user.Company.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate opacity-70">
                                {user.Company.companyAddress}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/company/${user.Company.id}`}
                              className={clsx(
                                "flex items-center gap-2 w-full p-2 rounded-sm transition-all duration-200",
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
                              <div className="relative h-8 w-8 shrink-0 rounded-sm overflow-hidden bg-muted">
                                <Image
                                  src={user.Company.logo || "/placeholder.svg"}
                                  alt={`${user.Company.name} Logo`}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-xs truncate">
                                  {user.Company.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate opacity-70">
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
                                "flex items-center gap-2 w-full p-2 rounded-sm transition-all duration-200",
                                {
                                  "bg-accent": isActive(`/unite/${unit.id}`),
                                  "hover:bg-accent/50": !isActive(
                                    `/unite/${unit.id}`
                                  ),
                                }
                              )}
                            >
                              <div className="h-8 w-8 flex items-center justify-center shrink-0 rounded-sm bg-muted">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-xs truncate">
                                  {unit.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate opacity-70">
                                  {unit.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/unite/${unit.id}`}
                                className={clsx(
                                  "flex items-center gap-2 w-full p-2 rounded-sm transition-all duration-200",
                                  {
                                    "bg-accent": isActive(`/unite/${unit.id}`),
                                    "hover:bg-accent/50": !isActive(
                                      `/unite/${unit.id}`
                                    ),
                                  }
                                )}
                              >
                                <div className="h-8 w-8 flex items-center justify-center shrink-0 rounded-sm bg-muted">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-xs truncate">
                                    {unit.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate opacity-70">
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
                        className="py-4 text-center text-xs text-muted-foreground"
                      >
                        Aucune unité disponible
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>

                {user?.role === "OWNER" && (
                  <div className="p-2 border-t border-border/20">
                    <SheetClose asChild>
                      <Button
                        className="w-full h-8 gap-2 text-xs"
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
                        <PlusCircleIcon className="h-3 w-3" />
                        Ajouter Unité
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col">
          <nav
            className={clsx("flex-1 py-2", {
              "px-4": !isCollapsed || !defaultOpen,
              "px-2": isCollapsed && defaultOpen,
            })}
          >
            {!isCollapsed || !defaultOpen ? (
              <div className="space-y-1">
                {roleSidebarOptions.map((option) => (
                  <Link
                    key={option.id}
                    href={option.link}
                    className={clsx(
                      "flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-150 group text-xs",
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
                    <span className="font-medium">{option.name}</span>
                    {isActive(option.link) && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-accent-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1 pt-2">
                {roleSidebarOptions.map((option) => (
                  <TooltipProvider key={option.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={option.link}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={clsx(
                              "w-10 h-10 relative transition-all duration-200 p-0",
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
                              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-accent-foreground rounded-full" />
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-background border border-border/50"
                      >
                        <p className="text-xs">{option.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </nav>

          {/* Add Unit Button for Collapsed State */}
          {isCollapsed && defaultOpen && user?.role === "OWNER" && (
            <div className="px-2 pb-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 p-0"
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
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-background border border-border/50"
                  >
                    <p className="text-xs">Ajouter Unité</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div
          className={clsx("border-t border-border/20 bg-muted/10", {
            "p-4": !isCollapsed || !defaultOpen,
            "p-2": isCollapsed && defaultOpen,
          })}
        >
          {!isCollapsed || !defaultOpen ? (
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0">
                <div className="w-full h-full rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user?.name || "Utilisateur"}
                  </p>
                  {user?.role === "OWNER" && (
                    <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate opacity-70">
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
                    <div className="relative w-10 h-10">
                      <div className="w-full h-full rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      {user?.role === "OWNER" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center">
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
                    <p className="text-xs font-medium">
                      {user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-muted-foreground opacity-70">
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
