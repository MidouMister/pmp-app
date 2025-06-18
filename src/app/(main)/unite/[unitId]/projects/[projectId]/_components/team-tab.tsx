"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { TeamMember, User } from "@prisma/client";

interface TeamTabProps {
  team?: {
    id: string;
    TeamMembers: (TeamMember & {
      user: User;
    })[];
  };
  onAddTeamMember: () => void;
  onEditTeamMember: (teamMember: TeamMember & { user: User }) => void;
  onRemoveTeamMember: (teamMember: TeamMember & { user: User }) => void;
}

/**
 * Composant pour l'onglet Équipe qui permet de gérer les membres de l'équipe du projet
 */
const TeamTab = ({
  team,
  onAddTeamMember,
  onEditTeamMember,
  onRemoveTeamMember,
}: TeamTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Équipe du projet</CardTitle>
          <CardDescription>
            Gérez les membres de l&apos;équipe du projet
          </CardDescription>
        </div>
        <Button onClick={onAddTeamMember}>Ajouter un membre</Button>
      </CardHeader>
      <CardContent>
        {team && team.TeamMembers && team.TeamMembers.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {team.TeamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                        {member.user.avatarUrl ? (
                          <Avatar className="w-fit h-fit">
                            <AvatarImage
                              src={member.user.avatarUrl || ""}
                              alt={member.user.name}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Users className="h-full w-full p-2" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTeamMember(member)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveTeamMember(member)}
                      >
                        Retirer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Aucun membre n&apos;a été ajouté à l&apos;équipe du projet
            </p>
            <Button className="mt-4" onClick={onAddTeamMember}>
              Ajouter un membre
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamTab;
