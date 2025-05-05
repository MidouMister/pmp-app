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
  const { setOpen } = useModal();
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );
  const [isMounted, setIsMounted] = useState(false);
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
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
          {
            "hidden md:inline-block z-0 w-[300px]": defaultOpen,
            "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <SheetTitle>Bonjour, </SheetTitle>
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full mb-6 py-6 justify-start mt-2"
                variant="ghost"
                disabled={user?.role !== "OWNER"}
              >
                <div className="flex items-center gap-3 text-left w-full">
                  <Compass className="h-5 w-5 shrink-0" />
                  <div className="flex flex-col flex-grow min-w-0">
                    <span className="font-medium truncate">{details.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {details.companyAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-5 w-5 text-muted-foreground shrink-0" />
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
                        {defaultOpen ? (
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
                          <SheetClose asChild>
                            <Link
                              href={`/company/${user.Company.id}`}
                              className="flex items-center gap-3 w-full p-2"
                            >
                              <div className="relative h-10 w-10 shrink-0">
                                <Image
                                  src={user.Company.logo || "/placeholder.svg"}
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
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Unités">
                    {units.length > 0 ? (
                      units.map((unit) => (
                        <CommandItem
                          key={unit.id}
                          className="p-0 hover:bg-muted"
                        >
                          {defaultOpen ? (
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
                            <SheetClose asChild>
                              <Link
                                href={`/unite/${unit.id}`}
                                className="flex items-center gap-3 w-full p-2"
                              >
                                <div className="relative h-10 w-10 shrink-0">
                                  <Image
                                    src={sidebarLogo || "/placeholder.svg"}
                                    alt={`${unit.name} Logo`}
                                    fill
                                    className="rounded-md object-contain"
                                  />
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
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem disabled>
                        Aucune unité disponible
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
                {user?.role === "OWNER" && (
                  <div className="p-2 border-t">
                    <SheetClose asChild>
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
                        <span>Ajouter Unité</span>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>

          <p className="text-muted-foreground text-xs mb-2">Menu Links</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Recherche..." />
              <CommandList className="py-4 overflow-visible">
                <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {roleSidebarOptions.map((roleSidebarOptions) => {
                    return (
                      <CommandItem
                        key={roleSidebarOptions.id}
                        className="md:w-[320px] w-full"
                      >
                        <Link
                          href={roleSidebarOptions.link}
                          className="flex items-center gap-2 hover:bg-transparent  rounded-md transition-all 
                          md:w-full w-[320px] p-1"
                        >
                          {roleSidebarOptions.icon}
                          <span className="font-semibold ">
                            {roleSidebarOptions.name}
                          </span>
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
