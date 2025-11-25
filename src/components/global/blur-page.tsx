"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const BlurPage = ({ children, className }: Props) => {
  return (
    <div
      className={twMerge(
        "overflow-scroll backdrop-blur-[35px] dark:bg-muted/40 bg-muted/60 dark:shadow-2xl dark:shadow-black mx-auto pt-24 pb-20 p-[1px] absolute top-0 right-0 left-0 bottom-0 z-[11] transition-all duration-300",
        className
      )}
      id="blur-page"
    >
      {children}
    </div>
  );
};

export default BlurPage;
