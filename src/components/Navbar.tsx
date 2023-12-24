"use client";
import React from "react";
import { Bars2Icon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const { isLoaded, userId } = useAuth();

  return (
    <nav className="flex justify-between items-center px-5 py-3 bg-card">
      <Link href={"/"}>
        <span className="flex items-center gap-1">
          <BookOpenIcon height={24} width={24} className="fill-primary" />
          <h1>Tailor Book</h1>
        </span>
      </Link>

      {isLoaded && userId && (
        <Sheet>
          <SheetTrigger asChild>
            <Bars2Icon height={24} width={24} className="cursor-pointer" />
          </SheetTrigger>
          <SheetContent className="pt-10">
            <Link
              href="/support"
              className="flex gap-2 mt-2 hover:underline px-3 py-2 rounded-md"
            >
              <QuestionMarkCircleIcon height={24} width={24} />
              Support
            </Link>
          </SheetContent>
        </Sheet>
      )}
    </nav>
  );
};

export default Navbar;
