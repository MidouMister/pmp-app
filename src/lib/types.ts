/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Client,
  Lane,
  Phase,
  Prisma,
  Product,
  Production,
  Project,
  Role,
  Team,
  TeamMember,
  User,
  NotificationType,
  TaskDependency,
} from "@prisma/client";
import { db } from "./db";
import {
  _getTasksWithAllRelations,
  getAuthUserDetails,
  getTasksWithTags,
} from "./queries";

export type SidebarOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  link: string;
};

// Notification types
export type NotificationUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  companyId: string | null;
};

export type NotificationItem = {
  User: NotificationUser;
  id: string;
  notification: string;
  companyId: string;
  unitId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
  type: NotificationType;
};

export type NotificationWithUser = NotificationItem[];

// Realtime payload types
export interface RealtimeNotificationPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: NotificationItem;
  old: NotificationItem;
}

// Supabase realtime payload structure
export interface SupabaseRealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
  schema: string;
  table: string;
  commit_timestamp: string;
  errors?: any[];
}

// Supabase realtime subscription status
export type RealtimeSubscriptionStatus =
  | "SUBSCRIBED"
  | "TIMED_OUT"
  | "CLOSED"
  | "CHANNEL_ERROR";

export const getUsersWithCompanyUnit = async (companyId: string) => {
  return await db.user.findFirst({
    where: {
      Company: {
        id: companyId,
      },
    },
    include: {
      Company: {
        include: {
          units: true,
        },
      },
    },
  });
};

export type UsersWithCompanyUnit = Prisma.PromiseReturnType<
  typeof getUsersWithCompanyUnit
>;

export type UserAuthDetails = Prisma.PromiseReturnType<
  typeof getAuthUserDetails
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUsersWithUnit = async (unitId: string) => {
  return await db.user.findFirst({
    where: {
      Unit: {
        id: unitId,
      },
    },
  });
};

export type UsersWithUnit = Prisma.PromiseReturnType<typeof getUsersWithUnit>;

export type ProjectWithDetails = Project & {
  Client: Client;
  phases: (Phase & {
    Product?: Product & {
      Productions?: Production[];
    };
  })[];
  team?:
    | (Team & {
        members: (TeamMember & {
          user: User;
        })[];
      })
    | null;
};

// Interface pour les productions d'unité avec détails
export interface ProductionWithDetails {
  id: string;
  date: Date;
  taux: number;
  mntProd: number;
  productId: string;
  // Relations
  Product: {
    id: string;
    Phase: {
      id: string;
      name: string;
      code: string;
      montantHT: number;
      projectId: string;
      Project: {
        id: string;
        code: string;
        name: string;
      };
    };
  };
}

export type TaskWithTags = Prisma.PromiseReturnType<typeof getTasksWithTags>;

// export type TaskAndTags = Task & {
//   Tags: Tag[]
//   Assigned: User | null

// }
export type LaneDetail = Lane & {
  Tasks: TaskWithTags;
};

export type TaskDetails = Prisma.PromiseReturnType<
  typeof _getTasksWithAllRelations
>;

// Gantt Chart Types
export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: "task" | "project" | "milestone";
  dependencies?: string[];
  isDisabled?: boolean;
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  project?: string;
  displayOrder?: number;
  hideChildren?: boolean;
}

export interface GanttDependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: "finishToStart" | "startToStart" | "finishToFinish" | "startToFinish";
  lag: number;
}

export interface PhaseWithDependencies extends Phase {
  predecessors: TaskDependency[];
  successors: TaskDependency[];
}

export interface ProjectWithPhasesAndDependencies extends Project {
  phases: PhaseWithDependencies[];
}
