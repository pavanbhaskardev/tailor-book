"use client";
import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";

const RedirectHeader = ({ name }: { name: string }) => {
  const router = useRouter();
  const { userId } = useAuth();

  return (
    <div className="flex items-center mt-2 gap-2 text-xl capitalize">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => router.push(userId ? "/dashboard" : "/")}
      >
        <ArrowLeftIcon height={16} width={16} />
      </Button>
      {name}
    </div>
  );
};

export default RedirectHeader;
