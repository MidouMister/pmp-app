"use client";

import { acceptInvitationAction } from "@/actions/invitation"; // Importez votre action
import Loading from "@/components/global/loading";
import { useEffect } from "react";

type Props = {
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
  };
};

const InvitationProcessor = ({ user }: Props) => {
  useEffect(() => {
    const process = async () => {
      await acceptInvitationAction(user.id, user.email, user.name, user.image);
    };
    process();
  }, [user]);

  return (
    <div className="h-screen w-full flex items-center justify-center flex-col gap-4">
      <Loading size="lg" text="Acceptation de l'invitation en cours..." />
    </div>
  );
};

export default InvitationProcessor;
