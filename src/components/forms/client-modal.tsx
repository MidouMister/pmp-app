"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import ClientForm from "./client-form";
import { useState } from "react";
import { Client } from "@prisma/client";

interface ClientModalProps {
  unitId: string;
  onClientCreated: (newClientId: string, newClientName: string) => void;
  trigger?: React.ReactNode;
}

export default function ClientModal({
  unitId,
  onClientCreated,
  trigger,
}: ClientModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (clientData: Client) => {
    onClientCreated(clientData.id, clientData.name);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Nouveau client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
          <DialogDescription>
            Créez un nouveau client dans votre liste de clients de l&apos;Unité.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          unitId={unitId}
          onSuccess={(clientData) => {
            if (clientData && clientData.id && clientData.name) {
              handleSuccess(clientData);
            }
          }}
        />
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
