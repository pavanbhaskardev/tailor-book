import React from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";
import { UsersIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const BottomBar = () => {
  return (
    <section className="fixed bottom-0 left-0 w-screen flex justify-between items-center px-5 py-3 bg-card">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/customers">
          <UsersIcon height={24} width={24} />
        </Link>
      </Button>

      <Button size="icon">
        <PlusIcon height={24} width={24} />
      </Button>

      <UserButton afterSignOutUrl="/" />
    </section>
  );
};

export default BottomBar;
