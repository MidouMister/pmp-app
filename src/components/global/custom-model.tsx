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
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  title,
  size = "lg",

  className = "",
}: Props) => {
  const { isOpen, setClose } = useModal();

  // Classes de taille pour différentes largeurs - TAILLES OPTIMISÉES
  const sizeClasses = {
    sm: "!max-w-xl !w-[40vw]",
    md: "!max-w-3xl !w-[60vw]",
    lg: "!max-w-5xl !w-[70vw]",
    xl: "!max-w-6xl !w-[80vw]",
    full: "!max-w-7xl !w-[90vw]",
  };

  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={`
          !overflow-auto 
          !max-h-[95vh] 
          !h-auto
          !min-w-[40vw]
          ${sizeClasses[size]}
          bg-background 
          border 
          border-border 
          rounded-lg 
          shadow-xl
          !p-0
          ${className}
        `}
        style={{
          width: size === "full" ? "95vw" : "90vw",
          maxWidth: size === "full" ? "1600px" : "1200px",
          minWidth: "700px",
        }}
      >
        <div className="p-6">
          <DialogHeader className="pb-4 text-left relative">
            <DialogTitle className="text-2xl font-bold text-foreground pr-8">
              {title}
            </DialogTitle>

            {subheading && (
              <DialogDescription className="text-muted-foreground text-base leading-relaxed mt-2">
                {subheading}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="pt-2">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
