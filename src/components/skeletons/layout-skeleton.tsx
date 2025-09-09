import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Menu,
  ChevronRight,
  Building2,
  LayoutDashboard,
  Settings,
  Users,
  CreditCard,
  Boxes,
  Shield,
} from "lucide-react";

// Skeleton for the Sidebar
const SidebarSkeleton = ({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) => {
  const sidebarItems = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/30 shadow-xl transition-all duration-300 z-10 ${
        isCollapsed ? "w-16" : "w-70"
      }`}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-8 bg-sidebar border border-sidebar-border/50 rounded-full p-1.5 shadow-md backdrop-blur-sm hidden md:flex items-center justify-center">
        <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/70" />
      </div>

      {/* Header */}
      <div
        className={`p-4 border-b border-sidebar-border/20 ${
          isCollapsed ? "px-2" : ""
        }`}
      >
        {/* Logo */}
        <div className="mb-6">
          <div
            className={`transition-all duration-300 rounded-xl overflow-hidden ${
              isCollapsed ? "aspect-square" : "aspect-[16/6]"
            }`}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/30 rounded-xl p-3 backdrop-blur-sm">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <div
          className={`transition-all duration-300 bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10 border border-sidebar-border/30 backdrop-blur-sm rounded-xl ${
            isCollapsed
              ? "w-12 h-12 p-0 flex items-center justify-center"
              : "w-full h-12 px-3 py-2"
          }`}
        >
          <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
            <Building2 className="h-4 w-4 text-sidebar-primary animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 min-w-0 ml-3 "></div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col pt-6 mt-10">
        <nav className={`flex-1 py-2 ${isCollapsed ? "px-2" : "px-4"}`}>
          {!isCollapsed ? (
            <div className="space-y-1">
              {sidebarItems.map((index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {index === 0 && (
                      <LayoutDashboard className="h-5 w-5 text-sidebar-foreground/70 animate-pulse" />
                    )}
                    {index === 1 && (
                      <Settings className="h-5 w-5 text-sidebar-foreground/70 animate-pulse" />
                    )}
                    {index === 2 && (
                      <Users className="h-5 w-5 text-sidebar-foreground/70 animate-pulse" />
                    )}
                    {index === 3 && (
                      <CreditCard className="h-5 w-5 text-sidebar-foreground/70 animate-pulse" />
                    )}
                    {index === 4 && (
                      <Boxes className="h-5 w-5 text-sidebar-foreground/70 animate-pulse" />
                    )}
                    {index === 5 && (
                      <Shield className="h-5 w-5 text-sidebar-foreground/70 animate-pulse" />
                    )}
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 pt-2">
              {sidebarItems.map((index) => (
                <div
                  key={index}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-sidebar-accent/10 animate-pulse"
                >
                  {index === 0 && (
                    <LayoutDashboard className="h-5 w-5 text-sidebar-foreground/70" />
                  )}
                  {index === 1 && (
                    <Settings className="h-5 w-5 text-sidebar-foreground/70" />
                  )}
                  {index === 2 && (
                    <Users className="h-5 w-5 text-sidebar-foreground/70" />
                  )}
                  {index === 3 && (
                    <CreditCard className="h-5 w-5 text-sidebar-foreground/70" />
                  )}
                  {index === 4 && (
                    <Boxes className="h-5 w-5 text-sidebar-foreground/70" />
                  )}
                  {index === 5 && (
                    <Shield className="h-5 w-5 text-sidebar-foreground/70" />
                  )}
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div
          className={`border-t border-sidebar-border/20 bg-gradient-to-r from-sidebar-accent/10 to-sidebar-accent/5 backdrop-blur-sm mt-40 ${
            isCollapsed ? "p-2" : "p-4"
          }`}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton for the InfoBar
const InfoBarSkeleton = ({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) => {
  return (
    <div
      className={`fixed z-[20] ${
        isCollapsed ? "md:left-[65px]" : "md:left-[280px]"
      } left-0 right-0 top-0 p-4 bg-background/95 backdrop-blur-lg flex gap-4 items-center border-b border-border/50 transition-all duration-300`}
    >
      <div className="flex items-center gap-3 ml-auto">
        {/* User Button Skeleton */}
        <Skeleton className="w-8 h-8 rounded-full" />

        {/* Notification Bell Skeleton */}
        <div className="relative">
          <div className="h-11 w-11 rounded-full bg-muted/50 flex items-center justify-center animate-pulse">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-muted rounded-full animate-pulse" />
          {/* Connection Status */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-muted animate-pulse" />
        </div>

        {/* Mode Toggle Skeleton */}
        <Skeleton className="w-10 h-10 rounded-md" />
      </div>
    </div>
  );
};

// Skeleton for the BlurPage content
const BlurPageSkeleton = ({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) => {
  const contentBlocks = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div
      className={`h-screen overflow-scroll backdrop-blur-[35px] dark:bg-muted/40 bg-muted/60 dark:shadow-2xl dark:shadow-black mx-auto pt-24 p-4 absolute top-0 right-0 left-0 bottom-0 z-[11] transition-all duration-300 ${
        isCollapsed ? "md:left-[65px]" : "md:left-[280px]"
      }`}
    >
      {/* Page Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-4 w-96 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-6 h-6" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {contentBlocks.slice(0, 4).map((index) => (
            <div
              key={index}
              className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {contentBlocks.slice(4).map((index) => (
            <div
              key={index}
              className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4"
            >
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-8 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/20"
            >
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mobile Menu Button Skeleton
const MobileMenuSkeleton = () => {
  return (
    <div className="fixed left-4 top-4 z-[100] md:hidden">
      <div className="h-10 w-10 bg-sidebar/80 backdrop-blur-sm border border-sidebar-border/50 rounded-md flex items-center justify-center animate-pulse">
        <Menu className="h-4 w-4 text-sidebar-foreground/70" />
      </div>
    </div>
  );
};

// Main Layout Skeleton Component
const LayoutSkeleton = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  return (
    <div className="h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <MobileMenuSkeleton />

      {/* Sidebar Skeleton */}
      <SidebarSkeleton isCollapsed={isCollapsed} />

      {/* InfoBar Skeleton */}
      <InfoBarSkeleton isCollapsed={isCollapsed} />

      {/* BlurPage Content Skeleton */}
      <BlurPageSkeleton isCollapsed={isCollapsed} />
    </div>
  );
};

export default LayoutSkeleton;
