"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { twMerge } from "tailwind-merge";
import {
  Bell,
  Check,
  Star,
  CheckCheck,
  Users,
  Calendar,
  Building2,
  ClipboardList,
  UserPlus,
  Activity,
  X,
  Trash2,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Role, NotificationType } from "@prisma/client";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import type { NotificationItem, NotificationWithUser } from "@/lib/types";
import { ModeToggle } from "./mode-toggle";
import { useSidebarCollapseContext } from "@/providers/sidebar-collapse-provider";
import { useNotification } from "@/hooks/use-notifications";

type Props = {
  notifications: NotificationWithUser | [];
  role?: Role;
  className?: string;
  unitId?: string;
};

const InfoBar = ({ notifications, unitId, className, role }: Props) => {
  const { isCollapsed } = useSidebarCollapseContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const {
    notifications: allNotifications,
    isConnected,
    handleMarkAsRead,
    setNotifications,
  } = useNotification({
    initialNotifications: notifications,
    unitId,
  });

  const handleUnitFilter = () => {
    if (!showAll) {
      setNotifications(notifications);
    } else {
      if (notifications?.length !== 0) {
        setNotifications(
          notifications?.filter((item) => item.unitId === unitId) ?? []
        );
      }
    }
    setShowAll((prev) => !prev);
  };

  const unreadCount = allNotifications?.filter((n) => !n.read).length ?? 0;

  const handleMarkAllAsRead = () => {
    allNotifications?.forEach((notification) => {
      if (!notification.read) {
        handleMarkAsRead(notification.id);
      }
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(
      (prev) => prev?.filter((n) => n.id !== notificationId) ?? []
    );
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes((prev) => [...prev, type]);
    } else {
      setSelectedTypes((prev) => prev.filter((t) => t !== type));
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case "INVITATION":
        return <UserPlus className={`${iconClass} text-blue-500`} />;
      case "PROJECT":
        return <Star className={`${iconClass} text-amber-500`} />;
      case "TASK":
        return <ClipboardList className={`${iconClass} text-emerald-500`} />;
      case "CLIENT":
        return <Users className={`${iconClass} text-purple-500`} />;
      case "PHASE":
        return <Calendar className={`${iconClass} text-purple-500`} />;
      case "TEAM":
        return <Users className={`${iconClass} text-indigo-500`} />;
      case "GENERAL":
        return <Activity className={`${iconClass} text-gray-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getFilteredNotifications = () => {
    let filtered = allNotifications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered?.filter(
        (n) =>
          n.notification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.User.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply read/unread filter
    if (selectedFilter === "unread") {
      filtered = filtered?.filter((n) => !n.read);
    } else if (selectedFilter === "read") {
      filtered = filtered?.filter((n) => n.read);
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered?.filter((n) =>
        selectedTypes.includes(n.type.toLowerCase())
      );
    }

    // Apply unit filter
    if (!showAll && unitId) {
      filtered = filtered?.filter((n) => n.unitId === unitId);
    }

    return filtered ?? [];
  };

  const filteredNotifications = getFilteredNotifications();

  const notificationTypes = [
    {
      key: "invitation",
      label: "Invitations",
      icon: UserPlus,
      color: "text-blue-500",
    },
    {
      key: "project_update",
      label: "Projects",
      icon: Star,
      color: "text-amber-500",
    },
    {
      key: "task_assignment",
      label: "Tasks",
      icon: ClipboardList,
      color: "text-emerald-500",
    },
    {
      key: "team_update",
      label: "Team",
      icon: Users,
      color: "text-indigo-500",
    },
    {
      key: "client_update",
      label: "Clients",
      icon: Users,
      color: "text-purple-500",
    },
    {
      key: "phase_update",
      label: "Phases",
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      key: "general",
      label: "General",
      icon: Activity,
      color: "text-gray-500",
    },
  ];

  const getTypeCount = (type: string) => {
    return (
      allNotifications?.filter((n) => n.type.toLowerCase() === type).length || 0
    );
  };

  const NotificationCard = ({
    notification,
  }: {
    notification: NotificationItem;
  }) => (
    <div
      className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
        notification.read
          ? "bg-muted/50 hover:bg-muted"
          : "bg-card border border-border shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-semibold">
            {getAvatarFallback(notification.User.name)}
          </div>
          {!notification.read && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">
                  {notification.notification?.split("|")[0] || ""}
                </span>
                <span className="text-muted-foreground ml-1">
                  {notification.notification?.split("|")[1] || ""}
                </span>
                {notification.notification?.split("|")[2] && (
                  <span className="font-semibold text-foreground ml-1">
                    {notification.notification.split("|")[2]}
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2 mt-2">
                {getNotificationIcon(notification.type)}
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDate(notification.createdAt)}
                </span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {notification.type.toLowerCase().replace("_", " ")}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="h-8 w-8 hover:bg-muted/50"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteNotification(notification.id)}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div
        className={twMerge(
          `fixed z-[20] ${
            isCollapsed ? "md:left-[56px]" : "md:left-[224px]"
          } left-0 right-0 top-0 p-4 bg-background/95 backdrop-blur-lg flex gap-4 items-center border-b border-border/50 transition-all duration-300`,
          className
        )}
      >
        <div className="flex items-center gap-3 ml-auto">
          <UserButton />

          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="relative h-11 w-11 rounded-full hover:bg-muted/50 transition-all duration-200"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background transition-colors duration-200 ${
                  isConnected ? "bg-green-500" : "bg-gray-400"
                }`}
                title={isConnected ? "Connected" : "Disconnected"}
              />
            </Button>
          </div>

          <ModeToggle />
        </div>
      </div>

      {/* Notification Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[480px] bg-background shadow-xl transform transition-transform duration-300 z-50 border-l border-border ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  Notifications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "All caught up! 🎉"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs hover:bg-muted/50 font-medium"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-muted/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Owner Unit Filter */}
            {role === "OWNER" && (
              <div className="flex items-center justify-between mt-4 p-3 bg-background/80 rounded-lg border border-border backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Current unit only</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUnitFilter}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !showAll ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                      !showAll ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Filters Section */}
          <div className="p-4 border-b border-border bg-muted/10 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-background/50 border-border/50 focus:bg-background"
              />
            </div>

            {/* Filter Tabs and Advanced Filters */}
            <div className="flex items-center justify-between gap-3">
              {/* Quick Filter Tabs */}
              <Tabs
                value={selectedFilter}
                onValueChange={setSelectedFilter}
                className="flex-1"
              >
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="all" className="text-xs">
                    All
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs px-1.5 py-0"
                    >
                      {allNotifications?.length || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Unread
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs px-1.5 py-0"
                    >
                      {unreadCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="read" className="text-xs">
                    Read
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs px-1.5 py-0"
                    >
                      {(allNotifications?.length || 0) - unreadCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Advanced Type Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 bg-transparent"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Types
                    {selectedTypes.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 text-xs px-1.5 py-0"
                      >
                        {selectedTypes.length}
                      </Badge>
                    )}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-semibold">
                    Filter by Type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    const count = getTypeCount(type.key);
                    return (
                      <DropdownMenuCheckboxItem
                        key={type.key}
                        checked={selectedTypes.includes(type.key)}
                        onCheckedChange={(checked) =>
                          handleTypeFilter(type.key, checked)
                        }
                        disabled={count === 0}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${type.color}`} />
                          <span className="text-sm">{type.label}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {count}
                        </Badge>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                  {selectedTypes.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTypes([])}
                        className="w-full text-xs"
                      >
                        Clear filters
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Active Filters Display */}
            {(selectedTypes.length > 0 || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="outline" className="text-xs">
                    Search: &quot;{searchQuery}&quot;
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery("")}
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {selectedTypes.map((type) => {
                  const typeInfo = notificationTypes.find(
                    (t) => t.key === type
                  );
                  if (!typeInfo) return null;
                  const Icon = typeInfo.icon;
                  return (
                    <Badge key={type} variant="outline" className="text-xs">
                      <Icon className={`w-3 h-3 mr-1 ${typeInfo.color}`} />
                      {typeInfo.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTypeFilter(type, false)}
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery || selectedTypes.length > 0
                    ? "No matching notifications"
                    : selectedFilter === "all"
                    ? "No notifications"
                    : `No ${selectedFilter} notifications`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedTypes.length > 0
                    ? "Try adjusting your search or filters."
                    : selectedFilter === "all"
                    ? "You're all caught up! New notifications will appear here."
                    : `No ${selectedFilter} notifications at the moment.`}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredNotifications.length} of{" "}
                {allNotifications?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default InfoBar;
