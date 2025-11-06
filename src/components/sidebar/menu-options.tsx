"use client";
import type { SidebarOption, UserAuthDetails } from "@/lib/types";
import type { Company, Unit } from "@prisma/client";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
  Dot,
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
    return linkPath === pathname;
  };
  const { setOpen } = useModal();
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { isCollapsed: contextIsCollapsed, toggleCollapse } =
    useSidebarCollapseContext();
  const isCollapsed = propIsCollapsed ?? contextIsCollapsed;

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setIsMounted(true);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check if user has access to multiple units or company
  const hasMultipleOptions = useMemo(() => {
    let optionCount = 0;
    if (user?.role === "OWNER" && user.Company) {
      optionCount++;
    }
    optionCount += units.length;
    return optionCount > 1;
  }, [user, units]);

  // Handle popover close when navigating
  const handleNavigation = () => {
    setIsPopoverOpen(false);
  };

  if (!isMounted) return null;
  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="fixed left-4 top-4 z-[100] md:hidden">
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0 bg-sidebar/80 backdrop-blur-sm border-sidebar-border/50 hover:bg-sidebar-accent/50 shadow-sm"
        >
          <Menu className="h-4 w-4 text-sidebar-foreground" />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side="left"
        className={clsx(
          "bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/30 p-0 transition-all duration-300 ease-out flex flex-col shadow-xl",
          {
            "hidden md:flex z-0": defaultOpen,
            "flex md:hidden z-[100] w-full": !defaultOpen,
            "w-70": defaultOpen && !isCollapsed,
            "w-16": defaultOpen && isCollapsed,
          }
        )}
      >
        {/* Modern Toggle Button */}
        {defaultOpen && (
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-8 bg-sidebar border border-sidebar-border/50 rounded-full p-1.5 
                     shadow-md hover:shadow-lg transition-all duration-300 hover:bg-sidebar-accent z-20 
                     hidden md:flex items-center justify-center group backdrop-blur-sm"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors" />
            )}
          </button>
        )}

        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Modern Header */}
        <div
          className={clsx("p-4 border-b border-sidebar-border/20", {
            "px-2": isCollapsed && defaultOpen,
          })}
        >
          {/* Refined Logo */}
          <div className="mb-6">
            <AspectRatio
              ratio={isCollapsed && defaultOpen ? 1 : 16 / 6}
              className="transition-all duration-300 rounded-xl overflow-hidden"
            >
              <div className="relative w-full h-full bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/30 rounded-xl p-3 backdrop-blur-sm">
                <Image
                  src={sidebarLogo || "/placeholder.svg"}
                  alt="Logo"
                  fill
                  className="object-contain p-1 rounded-lg filter drop-shadow-sm"
                />
              </div>
            </AspectRatio>
          </div>

          {/* Modern Company Selector */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <TooltipProvider
              delayDuration={isCollapsed && defaultOpen ? 100 : 1000}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      className={clsx(
                        "transition-all duration-300 bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10 hover:from-sidebar-accent/30 hover:to-sidebar-accent/20 border border-sidebar-border/30 backdrop-blur-sm font-medium shadow-sm hover:shadow-md",
                        {
                          "w-full min-h-16 justify-start px-3":
                            !isCollapsed || !defaultOpen,
                          "w-12 h-12 justify-center p-0":
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
                            "gap-3": !isCollapsed || !defaultOpen,
                            "": isCollapsed && defaultOpen,
                          }
                        )}
                      >
                        <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
                          <Compass className="h-4 w-4 text-sidebar-primary" />
                        </div>
                        {(!isCollapsed || !defaultOpen) && (
                          <div className="flex">
                            {user?.role === "OWNER" ? (
                              <div className="flex flex-col flex-1 min-w-0 text-left">
                                <>
                                  <span className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                                    {details.name}
                                  </span>
                                  <span className="text-xs text-sidebar-foreground/60 truncate">
                                    {details.companyAddress.toLocaleLowerCase()}
                                  </span>
                                </>
                              </div>
                            ) : (
                              <div className="flex flex-col flex-1 min-w-0 text-left">
                                <>
                                  <span className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                                    {user?.Unit?.name}
                                  </span>
                                  <span className="text-xs text-sidebar-foreground/60 truncate">
                                    {user?.Unit?.address.toLocaleLowerCase()}
                                  </span>
                                </>
                              </div>
                            )}

                            {user?.role === "OWNER" && hasMultipleOptions && (
                              <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                {isCollapsed && defaultOpen && (
                  <TooltipContent
                    side="right"
                    className="bg-sidebar border border-sidebar-border/50 shadow-lg"
                  >
                    <div>
                      <p className="font-semibold text-sm text-sidebar-foreground">
                        {details.name}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60">
                        {details.companyAddress}
                      </p>
                      {user?.role !== "OWNER" && (
                        <p className="text-xs text-sidebar-foreground/50 mt-1 italic">
                          Réservé aux propriétaires
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <PopoverContent
              className="w-80 p-0 border border-sidebar-border/50 bg-sidebar/95 backdrop-blur-xl shadow-xl"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={8}
              style={{ zIndex: isMobile ? 9999 : undefined }}
              avoidCollisions={true}
              collisionPadding={8}
            >
              <Command className="rounded-xl">
                <CommandList className="max-h-80 overflow-auto">
                  <CommandEmpty className="py-6 text-center text-sm text-sidebar-foreground/60">
                    Aucun résultat trouvé
                  </CommandEmpty>

                  {user?.role === "OWNER" && user.Company && (
                    <CommandGroup heading="Entreprise" className="px-2 py-2">
                      <CommandItem className="p-0 rounded-lg">
                        {defaultOpen ? (
                          <Link
                            href={`/company/${user.Company.id}`}
                            className={clsx(
                              "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200",
                              {
                                "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm":
                                  isActive(`/company/${user.Company.id}`),
                                "hover:bg-sidebar-accent/50": !isActive(
                                  `/company/${user.Company.id}`
                                ),
                              }
                            )}
                            onClick={handleNavigation}
                          >
                            <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/30">
                              <Image
                                src={user.Company.logo || "/placeholder.svg"}
                                alt={`${user.Company.name} Logo`}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-sm truncate">
                                {user.Company.name}
                              </span>
                              <span className="text-xs text-sidebar-foreground/60 truncate">
                                {user.Company.companyAddress}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/company/${user.Company.id}`}
                              className={clsx(
                                "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200",
                                {
                                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm":
                                    isActive(`/company/${user.Company.id}`),
                                  "hover:bg-sidebar-accent/50": !isActive(
                                    `/company/${user.Company.id}`
                                  ),
                                }
                              )}
                              onClick={handleNavigation}
                            >
                              <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/30">
                                <Image
                                  src={user.Company.logo || "/placeholder.svg"}
                                  alt={`${user.Company.name} Logo`}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm truncate">
                                  {user.Company.name}
                                </span>
                                <span className="text-xs text-sidebar-foreground/60 truncate">
                                  {user.Company.companyAddress}
                                </span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}

                  <CommandGroup heading="Unités" className="px-2 py-2">
                    {units.length > 0 ? (
                      units.map((unit) => (
                        <CommandItem key={unit.id} className="p-0 rounded-lg">
                          {defaultOpen ? (
                            <Link
                              href={`/unite/${unit.id}`}
                              className={clsx(
                                "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200",
                                {
                                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm":
                                    isActive(`/unite/${unit.id}`),
                                  "hover:bg-sidebar-accent/50": !isActive(
                                    `/unite/${unit.id}`
                                  ),
                                }
                              )}
                              onClick={handleNavigation}
                            >
                              <div className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/30">
                                <Building2 className="h-5 w-5 text-sidebar-foreground/70" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm truncate">
                                  {unit.name}
                                </span>
                                <span className="text-xs text-sidebar-foreground/60 truncate">
                                  {unit.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/unite/${unit.id}`}
                                className={clsx(
                                  "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200",
                                  {
                                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm":
                                      isActive(`/unite/${unit.id}`),
                                    "hover:bg-sidebar-accent/50": !isActive(
                                      `/unite/${unit.id}`
                                    ),
                                  }
                                )}
                                onClick={handleNavigation}
                              >
                                <div className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/30">
                                  <Building2 className="h-5 w-5 text-sidebar-foreground/70" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-sm truncate">
                                    {unit.name}
                                  </span>
                                  <span className="text-xs text-sidebar-foreground/60 truncate">
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
                        className="py-6 text-center text-sm text-sidebar-foreground/60"
                      >
                        Aucune unité disponible
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>

                {user?.role === "OWNER" && (
                  <div className="p-3 border-t border-sidebar-border/20">
                    <Button
                      className="w-full h-10 gap-2 text-sm bg-gradient-to-r from-sidebar-primary/10 to-sidebar-primary/5 hover:from-sidebar-primary/20 hover:to-sidebar-primary/10 border border-sidebar-primary/20 text-sidebar-primary font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      variant="outline"
                      onClick={() => {
                        setIsPopoverOpen(false);
                        setOpen(
                          "add-unit-modal",
                          <CustomModal
                            modalId="add-unit-modal"
                            title="Ajouter Unité"
                            subheading="Ajouter une nouvelle Unité à votre entreprise."
                          >
                            <UnitDetails
                              companyDetails={user?.Company as Company}
                              userName={user?.name}
                            />
                          </CustomModal>
                        );
                      }}
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      Ajouter Unité
                    </Button>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Modern Navigation */}
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium relative overflow-hidden",
                      {
                        "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm border border-sidebar-accent-foreground/10":
                          isActive(option.link),
                        "hover:bg-sidebar-accent/30 text-sidebar-foreground/80 hover:text-sidebar-foreground":
                          !isActive(option.link),
                      }
                    )}
                  >
                    <div
                      className={clsx(
                        "transition-colors duration-200 relative z-10",
                        {
                          "text-sidebar-accent-foreground": isActive(
                            option.link
                          ),
                          "text-sidebar-foreground/70 group-hover:text-sidebar-foreground":
                            !isActive(option.link),
                        }
                      )}
                    >
                      {option.icon}
                    </div>
                    <span className="relative z-10">{option.name}</span>
                    {isActive(option.link) && (
                      <div className="ml-auto relative z-10">
                        <Dot className="h-4 w-4 text-sidebar-accent-foreground animate-pulse" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 pt-2">
                {roleSidebarOptions.map((option) => (
                  <TooltipProvider key={option.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={option.link}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={clsx(
                              "w-12 h-12 relative transition-all duration-200 p-0 rounded-xl",
                              {
                                "bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm border border-sidebar-accent-foreground/10":
                                  isActive(option.link),
                                "hover:bg-sidebar-accent/30": !isActive(
                                  option.link
                                ),
                              }
                            )}
                          >
                            {option.icon}
                            {isActive(option.link) && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sidebar-primary text-sidebar-accent-foreground rounded-full border-2 border-sidebar animate-pulse" />
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-sidebar border border-sidebar-border/50 shadow-lg"
                      >
                        <p className="text-sm font-medium text-sidebar-accent-foreground">
                          {option.name}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </nav>

          {/* Modern Add Unit Button for Collapsed State */}
          {isCollapsed && defaultOpen && user?.role === "OWNER" && (
            <div className="px-2 pb-4">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-12 h-12 p-0 rounded-xl bg-gradient-to-br from-sidebar-primary/10 to-sidebar-primary/5 hover:from-sidebar-primary/20 hover:to-sidebar-primary/10 border border-sidebar-primary/20 text-sidebar-primary shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() =>
                        setOpen(
                          "add-unit-modal",
                          <CustomModal
                            modalId="add-unit-modal"
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
                    className="bg-sidebar border border-sidebar-border/50 shadow-lg"
                  >
                    <p className="text-sm font-medium text-sidebar-accent-foreground">
                      Ajouter Unité
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Modern User Profile */}
        <div
          className={clsx(
            "border-t border-sidebar-border/20 bg-gradient-to-r from-sidebar-accent/10 to-sidebar-accent/5 backdrop-blur-sm",
            {
              "p-4": !isCollapsed || !defaultOpen,
              "p-2": isCollapsed && defaultOpen,
            }
          )}
        >
          {!isCollapsed || !defaultOpen ? (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-sidebar-primary" />
                </div>
                {user?.role === "OWNER" && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-2 border-sidebar shadow-sm">
                    <Crown className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user?.name || "Utilisateur"}
                  </p>
                </div>
                <p className="text-xs text-sidebar-foreground/60 truncate">
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
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center shadow-sm">
                        <User className="h-5 w-5 text-sidebar-primary" />
                      </div>
                      {user?.role === "OWNER" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-2 border-sidebar shadow-sm">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-sidebar border border-sidebar-border/50 shadow-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">
                      {user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60">
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
