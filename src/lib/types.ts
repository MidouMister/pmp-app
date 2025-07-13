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
} from "@prisma/client";
import { db } from "./db";
import {
  _getTasksWithAllRelations,
  getAuthUserDetails,
  getTasksWithTags,
} from "./queries";
import { NotificationType } from "@prisma/client";

export type SidebarOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  link: string;
};

export type NotificationWithUser =
  | {
      User: {
        id: string;
        name: string;
        avatarUrl: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        companyId: string | null;
      };
      id: string;
      notification: string;
      companyId: string;
      unitId: string | null;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
      read: boolean;
      type: NotificationType;
    }[]
  | undefined;
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
