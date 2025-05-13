"use client";

import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { NotificationWithUser } from "@/lib/types";
import { ModeToggle } from "./mode-toggle";

type Props = {
  notifications: NotificationWithUser | [];
  role?: Role;
  className?: string;
  unitId?: string;
};

const InfoBar = ({ notifications, unitId, className, role }: Props) => {
  const [allNotifications, setAllNotifications] = useState(notifications);
  const [showAll, setShowAll] = useState(true);

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => item.unitId === unitId) ?? []
        );
      }
    }
    setShowAll((prev) => !prev);
  };

  return (
    <>
      <div
        className={twMerge(
          "fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]",
          className
        )}
      >
        <div className="flex items-center gap-4 ml-auto">
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger asChild>
              <button className="relative rounded-full w-10 h-10 bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center text-white">
                <Bell size={20} />
                {(notifications?.length ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications?.length ?? 0}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] mt-4 mr-4 pr-4 overflow-y-auto">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-2xl font-bold">
                  Notifications
                </SheetTitle>
                <SheetDescription>
                  {role === "OWNER" && (
                    <Card className="flex items-center justify-between p-4 mt-4">
                      <span className="font-medium">
                        Show Current Unit Only
                      </span>
                      <Switch
                        checked={!showAll}
                        onCheckedChange={handleClick}
                      />
                    </Card>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                {allNotifications?.length === 0 ? (
                  <div className="flex items-center justify-center text-muted-foreground h-40">
                    You have no notifications
                  </div>
                ) : (
                  allNotifications?.map((notification) => (
                    <Card
                      key={notification.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={notification.User.avatarUrl || ""}
                            alt="Profile Picture"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {notification.User.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            <span className="font-bold">
                              {notification.notification.split("|")[0]}
                            </span>
                            <span className="text-muted-foreground">
                              {notification.notification.split("|")[1]}
                            </span>
                            <span className="font-bold">
                              {notification.notification.split("|")[2]}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </>
  );
};

export default InfoBar;
