import {
  Client,
  Notification,
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
import { getAuthUserDetails } from "./queries";

export type SidebarOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  link: string;
};
export type NotificationWithUser =
  | ({
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
    } & Notification)[]
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
