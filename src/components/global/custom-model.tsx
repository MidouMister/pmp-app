"use client";
import { useModal } from "@/providers/modal-provider";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomModal = ({ children, defaultOpen, subheading, title }: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent className="overflow-scroll md:max-h-[700px] md:h-fit h-screen bg-background border border-border rounded-lg ">
        <DialogHeader className="pt-8 text-left">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mb-4">
            {subheading}
          </DialogDescription>
          {children}
        </DialogHeader>
      </DialogContent>
      <style jsx>{`
        /* Masquer le bouton de fermeture par défaut de Radix */
        [data-radix-dialog-close] {
          display: none !important;
        }
      `}</style>
    </Dialog>
  );
};

export default CustomModal;
