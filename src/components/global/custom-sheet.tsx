"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useModal } from "@/providers/modal-provider";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomSheet = ({ children, defaultOpen, subheading, title }: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Sheet open={isOpen || defaultOpen} onOpenChange={setClose}>
      <SheetContent
        side="right"
        className="overflow-y-auto w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-4 md:p-6"
      >
        <SheetHeader className="pt-8 pb-2 text-left">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {title}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground mb-6">
            {subheading}
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 px-2">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomSheet;
