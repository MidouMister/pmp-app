import AgentPulse from "@/components/global/agentPulse";
import { ModeToggle } from "@/components/global/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";
import { Logo } from "../logo";

type Props = {
  user?: null | User;
};

const Navigation = ({ user }: Props) => {
  return (
    <div className=" mx-10 my-1 rounded-b-2xl fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-10 border-b  border-b-accent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <aside className="flex items-center gap-2">
        <Logo className="text-primary" />
        <span className="text-xl font-bold"> PMP</span>
        <AgentPulse size="small" color="blue" />
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <Link href={"#"}>Pricing</Link>
          <Link href={"#"}>About</Link>
          <Link href={"#"}>Documentation</Link>
          <Link href={"#"}>Features</Link>
        </ul>
      </nav>
      <aside className="flex gap-1 items-center f">
        <Link
          href={"/company"}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  );
};

export default Navigation;
