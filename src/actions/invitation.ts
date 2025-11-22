"use server";

import { verifyAndAcceptInvitation } from "@/lib/queries";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

export const acceptInvitationAction = async (
  userId: string,
  userEmail: string,
  userName: string,
  userImage: string
) => {
  // 1. Exécuter la mutation DB
  const companyId = await verifyAndAcceptInvitation(
    userId,
    userEmail,
    userName,
    userImage
  );

  // 2. Si succès, invalider le cache et rediriger
  if (companyId) {
    // Ici, revalidateTag est autorisé ✅
    updateTag(`company-users-${companyId}`);
    redirect(`/company`);
  }

  return companyId;
};
