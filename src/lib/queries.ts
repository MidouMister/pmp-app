"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import {
  Client,
  Company,
  Phase,
  Project,
  Role,
  Unit,
  User,
} from "@prisma/client";

const avatarUrl = "https://cdn-icons-png.flaticon.com/512/3607/3607444.png";

export const saveActivityLogsNotification = async ({
  companyId,
  description,
  unitId,
}: {
  companyId?: string;
  description: string;
  unitId?: string;
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

  let foundCompanyId = companyId;
  if (!foundCompanyId) {
    if (!unitId) {
      throw new Error("You need to provide atleast a companyId or unit Id");
    }
    const response = await db.unit.findUnique({
      where: { id: unitId },
    });
    if (response) foundCompanyId = response.companyId;
  }
  if (unitId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Company: {
          connect: {
            id: foundCompanyId,
          },
        },
        Unit: {
          connect: { id: unitId },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Company: {
          connect: {
            id: foundCompanyId,
          },
        },
        Unit: {
          connect: { id: unitId },
        },
      },
    });
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
      description: `Joined`,
      unitId: invitationExists.unitId,
    });
    if (userDetails) {
      await (
        await clerkClient()
      ).users.updateUserMetadata(user.id, {
        // Use clerkClient() as a function
        privateMetadata: {
          role: userDetails.role || "USER", // add jobeTilte
        },
      });
      // delete invitation from db
      await db.invitation.delete({ where: { email: userDetails.email } });

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

  await (
    await clerkClient()
  ).users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "USER",
    },
  });

  return userData;
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
export const getNotificationAndUser = async (
  companyId: string,
  unitId?: string
) => {
  try {
    const response = await db.notification.findMany({
      where: {
        companyId: companyId,
        unitId: unitId,
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
  (await clerkClient()).users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
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

  try {
    await (
      await clerkClient()
    ).invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    console.log(error);
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
      include: {
        projects: true,
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
      unitId,
      description: `a supprimé le client ${client.name}`,
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
      unitId,
      description: `a supprimé le projet ${project.name}`,
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
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error;
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
