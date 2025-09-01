"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import {
  Client,
  Company,
  Lane,
  Phase,
  Prisma,
  Project,
  Role,
  Tag,
  Task,
  Unit,
  User,
} from "@prisma/client";
import { updateProductTaux, validateProductionTaux } from "./utils";
import { v4 } from "uuid";

const avatarUrl = "https://cdn-icons-png.flaticon.com/512/3607/3607444.png";

import { NotificationType } from "@prisma/client";

// Enhanced queries for better realtime support

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    // First, get the current notification to ensure we have all data
    const currentNotification = await db.notification.findUnique({
      where: { id: notificationId },
      include: { User: true },
    });

    if (!currentNotification) {
      throw new Error("Notification not found");
    }

    // Update the notification
    const response = await db.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
        updatedAt: new Date(), // Ensure updatedAt is set
      },
      include: {
        User: true, // Include User data in the response
      },
    });

    return response;
  } catch (error) {
    console.log("Error marking notification as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    // First, get the notification to ensure it exists
    const existingNotification = await db.notification.findUnique({
      where: { id: notificationId },
      include: { User: true },
    });

    if (!existingNotification) {
      throw new Error("Notification not found");
    }

    // Delete the notification
    const response = await db.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return response;
  } catch (error) {
    console.log("Failed to delete notification", error);
    throw error;
  }
};
// Enhanced notification creation with better error handling
export const saveActivityLogsNotification = async ({
  companyId,
  description,
  unitId,
  type,
}: {
  companyId?: string;
  description: string;
  unitId?: string;
  type?: NotificationType;
}) => {
  const authUser = await currentUser();
  let userData;

  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Company: {
          units: {
            some: { id: unitId },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    console.log("Could not find a user");
    return;
  }

  let foundCompanyId: string | undefined = companyId;
  if (!foundCompanyId) {
    if (!unitId) {
      throw new Error("You need to provide atleast a companyId or unit Id");
    }
    const response = await db.unit.findUnique({
      where: { id: unitId },
    });
    if (response) foundCompanyId = response.companyId;
  }

  if (!foundCompanyId) {
    throw new Error("Company ID could not be determined.");
  }

  try {
    const notificationData = {
      notification: `${userData.name} | ${description}`,
      type: type || "GENERAL",
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userData.id,
      companyId: foundCompanyId,
      ...(unitId && {
        Unit: {
          connect: { id: unitId },
        },
      }),
    };

    // Create notification with complete data
    const newNotification = await db.notification.create({
      data: {
        notification: notificationData.notification,
        type: notificationData.type,
        read: notificationData.read,
        createdAt: notificationData.createdAt,
        updatedAt: notificationData.updatedAt,
        userId: notificationData.userId,
        companyId: notificationData.companyId,
        ...(unitId && { unitId }),
      },
      include: {
        User: true, // Include User data in the response
      },
    });

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
export const getNotificationAndUser = async (
  companyId: string,
  unitId?: string
) => {
  const authUser = await currentUser();
  if (!authUser) {
    console.log("User not authenticated.");
    return [];
  }

  try {
    const response = await db.notification.findMany({
      where: {
        companyId: companyId,
        ...(unitId && { unitId: unitId }),
        userId: authUser.id, // Filter by authenticated user's ID
      },
      include: {
        User: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
// Function to fetch a single notification with user data
export const getNotificationWithUser = async (notificationId: string) => {
  try {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            role: true,
            companyId: true,
          },
        },
      },
    });

    return notification;
  } catch (error) {
    console.error("Error fetching notification with user:", error);
    return null;
  }
};

export const AddUser = async (
  companyId: string,

  user: User
) => {
  if (user.role === "OWNER") return null;
  const response = await db.user.create({ data: { ...user } });
  return response;
};
export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });
  if (invitationExists) {
    const userDetails = await AddUser(invitationExists.companyId, {
      email: invitationExists.email,
      companyId: invitationExists.companyId,
      avatarUrl: user.imageUrl || avatarUrl,
      unitId: invitationExists.unitId,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role as Role,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobeTitle: invitationExists.jobeTilte, // add jobetitle
      adminID: null,
    });
    await saveActivityLogsNotification({
      companyId: invitationExists.companyId,
      description: "Rejoint ",
      unitId: invitationExists.unitId,
      type: "INVITATION",
    });
    if (userDetails) {
      // Await the clerkClient() function call first
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(user.id, {
        // Use clerkClient() as a function
        privateMetadata: {
          role: userDetails.role || "USER", // add jobeTilte
        },
      });
      // delete invitation from db
      await db.invitation.delete({ where: { email: userDetails.email } });
      await clerk.invitations.revokeInvitation(userDetails.email);
      return userDetails.companyId;
    } else return null;
  } else {
    const company = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return company ? company.companyId : null;
  }
};
export const getAuthUserDetails = async () => {
  const user = await currentUser();

  if (!user) {
    return;
  }
  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },

    include: {
      Company: {
        include: {
          units: true,
        },
      },
      ownedCompany: true,
      admin: true,
      Unit: true,
    },
  });
  return userData;
};
export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return;

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "USER",
      jobeTitle: newUser.jobeTitle,
    },
  });
  try {
    // Await the clerkClient() function call first
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: newUser.role || "USER",
      },
    });
    return userData;
  } catch (error) {
    console.error("Clerk metadata update error:", error);
    throw error;
  }
};
export const deleteCompany = async (companyId: string) => {
  const response = await db.company.delete({
    where: { id: companyId },
  });
  return response;
};
export const upsertCompany = async (company: Company) => {
  if (!company.id) return null;
  // if (!company.companyEmail) return null;
  try {
    const companyDetails = await db.company.upsert({
      where: {
        id: company.id,
      },
      update: company,
      create: {
        id: company.id,
        name: company.name,
        companyEmail: company.companyEmail,
        companyPhone: company.companyPhone,
        companyAddress: company.companyAddress,
        logo: company.logo,
        state: company.state,
        formJur: company.formJur,
        registre: company.registre,
        nif: company.nif,
        secteur: company.secteur,
        companyOwner: {
          connect: { id: company.ownerId },
        },
        users: {
          connect: { id: company.ownerId },
        },
      },
    });

    // Create default plans first if they don't exist
    await createDefaultPlans();

    // Check if it's a new company (no subscription) and create a starter plan
    const existingSubscription = await db.subscription.findUnique({
      where: { companyId: company.id },
    });

    if (!existingSubscription) {
      // Create starter subscription
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      await db.subscription.create({
        data: {
          planId: "starter",
          companyId: company.id,
          price: 0, // Starter plan is free
          startAt: now,
          endAt: endDate,
          active: true,
        },
      });
    }

    return companyDetails;
  } catch (error) {
    console.log(error);
  }
};

export const getCompanySubscription = async (companyId: string) => {
  try {
    const subscription = await db.subscription.findUnique({
      where: {
        companyId: companyId,
      },
      include: {
        Plan: true,
      },
    });
    return subscription;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPlans = async () => {
  try {
    const plans = await db.plan.findMany();
    return plans;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const createDefaultPlans = async () => {
  try {
    // Check if plans already exist
    const existingPlans = await db.plan.findMany();
    if (existingPlans.length > 0) return existingPlans;

    // Create default plans
    await db.plan.createMany({
      data: [
        {
          id: "starter",
          name: "Starter",
          monthlyCost: 0,
          maxUnits: 1,
          maxProjects: 5,
          maxTasksPerProject: 20,
          userLimit: 4,
        },
        {
          id: "pro",
          name: "Pro",
          monthlyCost: 3500,
          maxUnits: 5,
          maxProjects: 20,
          maxTasksPerProject: 100,
          userLimit: 20,
        },
        {
          id: "premium",
          name: "Premium",
          monthlyCost: 7500,
          maxUnits: null, // Unlimited
          maxProjects: null, // Unlimited
          maxTasksPerProject: null, // Unlimited
          userLimit: null, // Unlimited
        },
      ],
    });

    return await db.plan.findMany();
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const createOrUpdateSubscription = async (
  companyId: string,
  planId: string
) => {
  try {
    const plan = await db.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const subscription = await db.subscription.upsert({
      where: {
        companyId: companyId,
      },
      update: {
        planId: planId,
        price: plan.monthlyCost,
        startAt: now,
        endAt: endDate,
        updatedAt: now,
        active: true,
      },
      create: {
        planId: planId,
        companyId: companyId,
        price: plan.monthlyCost,
        startAt: now,
        endAt: endDate,
        active: true,
      },
    });

    return subscription;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const getUnitDetails = async (unitId: string) => {
  const response = await db.unit.findUnique({
    where: { id: unitId },
  });
  return response;
};

export const upsertUnit = async (unit: Unit) => {
  if (!unit.email) return null;
  const companyOwner = await db.user.findFirst({
    where: {
      Company: {
        id: unit.companyId,
      },
      role: "OWNER",
    },
  });
  if (!companyOwner) return console.log("🔴Erorr could not create unit");
  // const permissionId = v4();
  const response = await db.unit.upsert({
    where: { id: unit.id },
    update: unit,
    create: {
      ...unit,
    },
  });
  return response;
};
export const deleteUnit = async (unitId: string) => {
  const response = await db.unit.delete({
    where: { id: unitId },
  });
  return response;
};
export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};
export const deleteUser = async (userId: string) => {
  try {
    // Await the clerkClient() function call first
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: undefined,
      },
    });
    const deletedUser = await db.user.delete({ where: { id: userId } });

    return deletedUser;
  } catch (error) {
    console.error("Clerk metadata update error:", error);
    throw error;
  }
};
export const getCompanyUnits = async (companyId: string) => {
  const units = await db.unit.findMany({
    where: {
      companyId,
    },
  });

  return units;
};
export const sendInvitation = async (
  role: Role,
  email: string,
  companyId: string,
  unitId: string,
  jobeTilte: string
) => {
  // Check if an invitation already exists
  const existingInvitation = await db.invitation.findUnique({
    where: { email },
  });

  let response;
  if (existingInvitation) {
    // Update the existing invitation
    response = await db.invitation.update({
      where: { email },
      data: { companyId, role, unitId, status: "PENDING", jobeTilte },
    });
  } else {
    // Create a new invitation
    response = await db.invitation.create({
      data: { email, companyId, role, unitId, jobeTilte },
    });
  }

  console.log(response);

  try {
    // Await the clerkClient() function call first
    const clerk = await clerkClient();

    await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL || "",
      publicMetadata: {
        throughInvitation: true,
        role,
      },
      ignoreExisting: true, // Add this to handle existing invitations/users
    });

    console.log(`Clerk invitation sent successfully to ${email}`);
  } catch (error) {
    console.error("Clerk invitation error:", error);
    throw error;
  }

  return response;
};

// Récupérer tous les clients d'une unité
export const getUnitClients = async (unitId: string) => {
  try {
    const clients = await db.client.findMany({
      where: {
        unitId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return clients;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Récupérer un client par son ID
export const getClientById = async (clientId: string) => {
  try {
    const client = await db.client.findUnique({
      where: {
        id: clientId,
      },
    });
    return client;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Créer ou mettre à jour un client
export const upsertClient = async (client: Client) => {
  try {
    // Vérifier si l'email est unique (s'il est fourni)
    if (client.email) {
      const existingClientWithEmail = await db.client.findUnique({
        where: {
          email: client.email,
        },
      });

      if (existingClientWithEmail && existingClientWithEmail.id !== client.id) {
        throw new Error("Un client avec cet email existe déjà");
      }
    }

    // Vérifier si le nom est unique
    const existingClientWithName = await db.client.findUnique({
      where: {
        name: client.name,
      },
    });

    if (existingClientWithName && existingClientWithName.id !== client.id) {
      throw new Error("Un client avec ce nom existe déjà");
    }

    const response = await db.client.upsert({
      where: {
        id: client.id,
      },
      update: {
        name: client.name,
        wilaya: client.wilaya,
        phone: client.phone,
        email: client.email,
      },
      create: {
        id: client.id,
        name: client.name,
        wilaya: client.wilaya,
        phone: client.phone,
        email: client.email,
        unit: {
          connect: {
            id: client.unitId,
          },
        },
      },
    });

    await saveActivityLogsNotification({
      unitId: client.unitId,
      description: `${client.id ? "a modifié" : "a ajouté"} le client ${
        client.name
      }`,
      type: "CLIENT",
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Supprimer un client
export const deleteClient = async (clientId: string, unitId: string) => {
  try {
    // Vérifier si le client a des projets
    const clientWithProjects = await db.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        projects: true,
      },
    });

    if (clientWithProjects && clientWithProjects.projects.length > 0) {
      throw new Error("Impossible de supprimer un client qui a des projets");
    }

    const client = await db.client.delete({
      where: {
        id: clientId,
      },
    });

    await saveActivityLogsNotification({
      unitId: unitId,
      description: `a supprimé le client ${client.name}`,
      type: "CLIENT",
    });

    return client;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Récupérer tous les projets d'une unité
export const getUnitProjects = async (unitId: string) => {
  try {
    const projects = await db.project.findMany({
      where: {
        unitId,
      },
      include: {
        Client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Récupérer les projets d'une unité avec leurs phases pour le filtre du DataTable
export const getProjectsByUnitId = async (unitId: string) => {
  try {
    const projects = await db.project.findMany({
      where: {
        unitId,
      },
      include: {
        phases: true,
      },
      orderBy: {
        code: "asc",
      },
    });
    return projects;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des projets de l'unité:",
      error
    );
    return [];
  }
};

// Récupérer un projet par son ID
export const getProjectById = async (projectId: string) => {
  try {
    const project = await db.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        Client: true,
        phases: true,
        team: {
          include: {
            members: true,
          },
        },
      },
    });
    return project;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Créer ou mettre à jour un projet
export const upsertProject = async (project: Project) => {
  try {
    // Vérifier si le code est unique
    const existingProjectWithCode = await db.project.findFirst({
      where: {
        code: project.code,
        NOT: {
          id: project.id,
        },
      },
    });

    if (existingProjectWithCode) {
      throw new Error("Un projet avec ce code existe déjà");
    }

    const response = await db.project.upsert({
      where: {
        id: project.id,
      },
      update: {
        name: project.name,
        code: project.code,
        type: project.type,
        montantHT: project.montantHT,
        montantTTC: project.montantTTC,
        ods: project.ods,
        delai: project.delai,
        status: project.status,
        signe: project.signe,
      },
      create: {
        id: project.id,
        name: project.name,
        code: project.code,
        type: project.type,
        montantHT: project.montantHT,
        montantTTC: project.montantTTC,
        ods: project.ods,
        delai: project.delai,
        status: project.status,
        signe: project.signe,
        Client: {
          connect: {
            id: project.clientId,
          },
        },
        Unit: {
          connect: {
            id: project.unitId,
          },
        },
      },
    });

    await saveActivityLogsNotification({
      unitId: project.unitId,
      description: `${project.id ? "a modifié" : "a ajouté"} le projet ${
        project.name
      }`,
      type: "PROJECT",
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Supprimer un projet
export const deleteProject = async (projectId: string, unitId: string) => {
  try {
    const project = await db.project.delete({
      where: {
        id: projectId,
      },
    });

    await saveActivityLogsNotification({
      unitId: unitId,
      description: `a supprimé le projet ${project.name}`,
      type: "PROJECT",
    });

    return project;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// Récupérer les détails d'un projet
export const getProjectDetails = async (projectId: string) => {
  return await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Client: true,
      phases: {
        include: {
          Product: {
            include: {
              Productions: true,
            },
          },
        },
        orderBy: {
          start: "asc",
        },
      },
      team: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
      GanttMarker: true,
    },
  });
};

// Ajouter ou mettre à jour une phase
export const upsertPhase = async (phase: Phase) => {
  try {
    const response = await db.phase.upsert({
      where: {
        id: phase.id,
      },
      update: {
        name: phase.name,
        code: phase.code,
        montantHT: phase.montantHT,
        start: phase.start,
        end: phase.end,
        status: phase.status,
        obs: phase.obs,
      },
      create: {
        id: phase.id,
        name: phase.name,
        code: phase.code,
        montantHT: phase.montantHT,
        start: phase.start,
        end: phase.end,
        status: phase.status,
        obs: phase.obs,
        Project: {
          connect: {
            id: phase.projectId,
          },
        },
      },
    });

    // Récupérer les informations du projet pour la notification
    const project = await db.project.findUnique({
      where: { id: phase.projectId },
      select: { unitId: true },
    });

    if (project) {
      await saveActivityLogsNotification({
        unitId: project.unitId,
        description: `${phase.id ? "a modifié" : "a ajouté"} la phase ${
          phase.name
        } du projet`,
        type: "PHASE",
      });
    }

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// Récupérer une phase par ID
export const getPhaseById = async (phaseId: string) => {
  try {
    if (!phaseId) {
      throw new Error("ID de la phase requis");
    }

    const phase = await db.phase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      throw new Error("Phase non trouvée");
    }

    return phase;
  } catch (error) {
    console.error("Erreur lors de la récupération de la phase:", error);
    throw error;
  }
};
// Modifier la phase drag
export const onMovePhase = async (
  id: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const response = await db.phase.update({
      where: {
        id,
      },
      data: {
        start: startDate,
        end: endDate,
      },
      include: {
        Project: {
          select: { unitId: true },
        },
      },
    });

    if (response) {
      await saveActivityLogsNotification({
        unitId: response.Project.unitId,
        description: `a modifié la periode de la phase ${response.name} du projet`,
        type: "PHASE",
      });
    }
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// Supprimer une phase
export const deletePhase = async (phaseId: string) => {
  try {
    // Récupérer les informations de la phase et du projet pour la notification
    const phase = await db.phase.findUnique({
      where: { id: phaseId },
      include: {
        Project: {
          select: { unitId: true },
        },
      },
    });

    if (!phase) {
      throw new Error("Phase non trouvée");
    }

    const response = await db.phase.delete({
      where: {
        id: phaseId,
      },
    });

    await saveActivityLogsNotification({
      unitId: phase.Project.unitId,
      description: `a supprimé la phase ${phase.name} du projet`,
      type: "PHASE",
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// Gantt Marker CRUD Operations
export const getGanttMarkers = async (projectId: string) => {
  try {
    const response = await db.ganttMarker.findMany({
      where: { projectId },
      orderBy: { date: "asc" },
    });

    return response;
  } catch (error) {
    console.error("Error fetching gantt markers:", error);
    throw new Error("Failed to fetch gantt markers");
  }
};

export const createGanttMarker = async (data: {
  label: string;
  date: Date;
  className?: string;
  projectId: string;
}) => {
  try {
    const response = await db.ganttMarker.create({
      data: {
        ...data,
      },
      include: {
        Project: {
          select: { unitId: true, name: true },
        },
      },
    });
    await saveActivityLogsNotification({
      unitId: response.Project.unitId,
      description: `nouveau marqueur pour le projet ${response.Project.name}`,
      type: "PROJECT",
    });
  } catch (error) {
    console.error("Error creating gantt marker:", error);
    throw new Error("Failed to create gantt marker");
  }
};

export const updateGanttMarker = async (
  markerId: string,
  data: Partial<{
    label: string;
    date: Date;
    className: string;
  }>
) => {
  try {
    const response = await db.ganttMarker.update({
      where: { id: markerId },
      include: {
        Project: {
          select: { unitId: true, name: true },
        },
      },
      data,
    });

    await saveActivityLogsNotification({
      unitId: response.Project.unitId,
      description: `marqueur ${response.label} est moddifier pour le projet ${response.Project.name} `,
      type: "PROJECT",
    });
    return response;
  } catch (error) {
    console.error("Error updating gantt marker:", error);
    throw new Error("Failed to update gantt marker");
  }
};

export const deleteGanttMarker = async (markerId: string) => {
  try {
    return await db.ganttMarker.delete({
      where: { id: markerId },
    });
  } catch (error) {
    console.error("Error deleting gantt marker:", error);
    throw new Error("Failed to delete gantt marker");
  }
};

// Créer une équipe pour un projet s'il n'en a pas déjà une
export const createTeamForProject = async (projectId: string) => {
  try {
    // Vérifier si le projet a déjà une équipe
    const existingTeam = await db.team.findUnique({
      where: {
        projectId,
      },
    });

    if (existingTeam) {
      return existingTeam;
    }

    // Créer une nouvelle équipe
    const team = await db.team.create({
      data: {
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    // Récupérer les informations du projet pour la notification
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { unitId: true, name: true },
    });

    if (project) {
      await saveActivityLogsNotification({
        unitId: project.unitId,
        description: `a créé une équipe pour le projet ${project.name}`,
        type: "TEAM",
      });
    }

    return team;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Ajouter un membre à l'équipe du projet
export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: string
) => {
  try {
    // Vérifier si l'utilisateur est déjà membre de l'équipe
    const existingMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new Error("L'utilisateur est déjà membre de cette équipe");
    }

    // Ajouter le membre à l'équipe
    const teamMember = await db.teamMember.create({
      data: {
        role,
        team: {
          connect: {
            id: teamId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        team: {
          include: {
            project: {
              select: {
                unitId: true,
                name: true,
              },
            },
          },
        },
        user: true,
      },
    });

    await saveActivityLogsNotification({
      unitId: teamMember.team.project.unitId,
      description: `a ajouté ${teamMember.user.name} à l'équipe du projet ${teamMember.team.project.name}`,
      type: "TEAM",
    });

    return teamMember;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Mettre à jour le rôle d'un membre de l'équipe
export const updateTeamMember = async (teamMemberId: string, role: string) => {
  try {
    // Récupérer les informations du membre pour la notification
    const existingMember = await db.teamMember.findUnique({
      where: { id: teamMemberId },
      include: {
        user: true,
        team: {
          include: {
            project: {
              select: {
                unitId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingMember) {
      throw new Error("Membre d'équipe non trouvé");
    }

    // Mettre à jour le rôle du membre
    const teamMember = await db.teamMember.update({
      where: {
        id: teamMemberId,
      },
      data: {
        role,
      },
    });

    await saveActivityLogsNotification({
      unitId: existingMember.team.project.unitId,
      description: `a modifié le rôle de ${existingMember.user.name} dans l'équipe du projet ${existingMember.team.project.name}`,
      type: "TEAM",
    });

    return teamMember;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Supprimer un membre de l'équipe
export const removeTeamMember = async (teamMemberId: string) => {
  try {
    // Récupérer les informations du membre pour la notification
    const teamMember = await db.teamMember.findUnique({
      where: { id: teamMemberId },
      include: {
        user: true,
        team: {
          include: {
            project: {
              select: {
                unitId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!teamMember) {
      throw new Error("Membre d'équipe non trouvé");
    }

    // Supprimer le membre de l'équipe
    await db.teamMember.delete({
      where: {
        id: teamMemberId,
      },
    });

    await saveActivityLogsNotification({
      unitId: teamMember.team.project.unitId,
      description: `a retiré ${teamMember.user.name} de l'équipe du projet ${teamMember.team.project.name}`,
      type: "TEAM",
    });

    return teamMember;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Récupérer les utilisateurs disponibles pour une unité (pour ajouter à l'équipe)
export const getUnitUsers = async (unitId: string) => {
  try {
    const users = await db.user.findMany({
      where: {
        unitId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Récupérer un produit par ID ou par phaseId
export const getProductById = async (id?: string, phaseId?: string) => {
  try {
    if (!id && !phaseId) {
      throw new Error("ID du produit ou ID de la phase requis");
    }

    let product;
    if (id) {
      product = await db.product.findUnique({
        where: { id },
        include: {
          Productions: true,
          Phase: true,
        },
      });
    } else if (phaseId) {
      // Récupérer d'abord la phase pour obtenir le produit associé
      const phase = await db.phase.findUnique({
        where: { id: phaseId },
        include: {
          Product: {
            include: {
              Productions: true,
            },
          },
        },
      });

      if (phase && phase.Product) {
        product = phase.Product;
      }
    }

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    return product;
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    throw error;
  }
};

// Créer un nouveau produit pour une phase
export const createProduct = async (phaseId: string) => {
  try {
    if (!phaseId) {
      throw new Error("ID de la phase requis");
    }

    // Vérifier si la phase existe
    const phase = await db.phase.findUnique({
      where: { id: phaseId },
      include: {
        Product: true,
      },
    });

    if (!phase) {
      throw new Error("Phase non trouvée");
    }

    // Si un produit existe déjà pour cette phase, le retourner au lieu de lancer une erreur
    if (phase.Product) {
      return phase.Product;
    }

    // Créer le produit avec taux initial à 0%
    const product = await db.product.create({
      data: {
        phaseId,
        date: new Date(),
        taux: 0,
        montantProd: 0,
      },
    });

    return product;
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    throw error;
  }
};

// Supprimer un produit
export const deleteProduct = async (id: string) => {
  try {
    if (!id) {
      throw new Error("ID du produit requis");
    }

    // Vérifier si le produit existe
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Supprimer le produit (les productions seront supprimées en cascade)
    await db.product.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    throw error;
  }
};

// Récupérer toutes les productions d'un produit
export const getProductionsByProductId = async (productId: string) => {
  try {
    if (!productId) {
      throw new Error("ID du produit requis");
    }

    const productions = await db.production.findMany({
      where: { productId },
      orderBy: { date: "desc" },
    });

    return productions;
  } catch (error) {
    console.error("Erreur lors de la récupération des productions:", error);
    throw error;
  }
};

// Créer une nouvelle production
export const createProduction = async (
  productId: string,
  date: Date,
  taux: number
) => {
  try {
    if (!productId || !date || taux === undefined) {
      throw new Error("Tous les champs sont requis");
    }

    // Valider le taux de production
    const validation = await validateProductionTaux(productId, taux);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Créer la production
    const production = await db.production.create({
      data: {
        productId,
        date: new Date(date),
        taux,
        mntProd: validation.montantProduit || 0,
      },
    });

    // Mettre à jour le taux total du produit
    await updateProductTaux(productId);

    return production;
  } catch (error) {
    console.error("Erreur lors de la création de la production:", error);
    throw error;
  }
};

// Mettre à jour une production
export const updateProduction = async (
  id: string,
  productId: string,
  date: Date,
  taux: number
) => {
  try {
    if (!id || !productId || !date || taux === undefined) {
      throw new Error("Tous les champs sont requis");
    }

    // Valider le taux de production
    const validation = await validateProductionTaux(productId, taux, id);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Mettre à jour la production
    const production = await db.production.update({
      where: { id },
      data: {
        date: new Date(date),
        taux,
        mntProd: validation.montantProduit || 0,
      },
    });

    // Mettre à jour le taux total du produit
    await updateProductTaux(productId);

    return production;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la production:", error);
    throw error;
  }
};

// Récupérer toutes les productions d'une unité avec détails
export const getUnitProductionsWithDetails = async (unitId: string) => {
  try {
    if (!unitId) {
      throw new Error("ID de l'unité requis");
    }

    // Récupérer les projets de l'unité avec leurs phases, produits et productions
    const projects = await db.project.findMany({
      where: { unitId },
      include: {
        phases: {
          include: {
            Product: {
              include: {
                Productions: true,
              },
            },
          },
        },
      },
    });

    // Transformer les données pour obtenir une liste plate de productions avec détails
    const productions = projects.flatMap((project) =>
      project.phases.flatMap(
        (phase) =>
          phase.Product?.Productions?.map((production) => ({
            ...production,
            Product: {
              id: phase.Product!.id,
              Phase: {
                id: phase.id,
                name: phase.name,
                code: phase.code,
                montantHT: phase.montantHT,
                projectId: phase.projectId,
                Project: {
                  id: project.id,
                  code: project.code,
                  name: project.name,
                },
              },
            },
          })) || []
      )
    );

    return productions;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des productions de l'unité:",
      error
    );
    throw error;
  }
};

// Supprimer une production
export const deleteProduction = async (id: string) => {
  try {
    if (!id) {
      throw new Error("ID de la production requis");
    }

    // Récupérer la production pour connaître son productId avant suppression
    const production = await db.production.findUnique({
      where: { id },
    });

    if (!production) {
      throw new Error("Production non trouvée");
    }

    const productId = production.productId;

    // Supprimer la production
    await db.production.delete({
      where: { id },
    });

    // Mettre à jour le taux total du produit
    await updateProductTaux(productId);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la production:", error);
    throw error;
  }
};
export const getTasksWithTags = async (unitId: string) => {
  const response = await db.task.findMany({
    where: {
      Lane: {
        unitId,
      },
    },
    include: {
      Tags: true,
      Assigned: true,
    },
  });

  return response;
};
export const upsertTag = async (
  unitId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), unitId: unitId },
    update: tag,
    create: { ...tag, unitId: unitId },
  });

  return response;
};
export const getTagsForUnit = async (unitId: string) => {
  const response = await db.unit.findUnique({
    where: { id: unitId },
    select: { Tag: true },
  });
  return response;
};
export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } });
  return response;
};
export const upsertTask = async (
  task: Prisma.TaskUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number;
  if (!task.order) {
    const tasks = await db.task.findMany({
      where: { laneId: task.laneId },
    });
    order = tasks.length;
  } else {
    order = task.order;
  }

  const response = await db.task.upsert({
    where: {
      id: task.id || v4(),
    },
    update: { ...task, Tags: { set: tags } },
    create: { ...task, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Tags: true,
      Lane: true,
    },
  });

  return response;
};
export const deleteTask = async (taskId: string) => {
  const response = await db.task.delete({
    where: {
      id: taskId,
    },
  });

  return response;
};
export const getLanesWithTaskAndTags = async (unitId: string) => {
  const response = await db.lane.findMany({
    where: {
      unitId,
    },
    orderBy: { order: "asc" },
    include: {
      Tasks: {
        orderBy: {
          order: "asc",
        },
        include: {
          Tags: true,
          Assigned: true,
        },
      },
    },
  });
  return response;
};
export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number;

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        unitId: lane.unitId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  });

  return response;
};
export const deleteLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } });
  return resposne;
};
export const updateTaskOrder = async (tasks: Task[]) => {
  try {
    const updateTrans = tasks.map((task) =>
      db.task.update({
        where: {
          id: task.id,
        },
        data: {
          order: task.order,
          laneId: task.laneId,
        },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Task Done reordered 🟢");
  } catch (error) {
    console.log(error, "🔴 ERROR UPDATE TASK ORDER");
  }
};
export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "ERROR UPDATE LANES ORDER");
  }
};
export const _getTasksWithAllRelations = async (laneId: string) => {
  const response = await db.task.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Lane: true,
      Tags: true,
    },
  });
  return response;
};
